import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Get all boards for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, 
        json_agg(json_build_object(
          'id', c.id,
          'name', c.name,
          'order_index', c.order_index,
          'tasks', (
            SELECT json_agg(json_build_object(
              'id', t.id,
              'title', t.title,
              'description', t.description,
              'due_date', t.due_date,
              'priority', t.priority,
              'assignee_id', t.assignee_id,
              'order_index', t.order_index
            ))
            FROM tasks t
            WHERE t.column_id = c.id
            ORDER BY t.order_index
          )
        )) as columns
       FROM boards b
       LEFT JOIN columns c ON b.id = c.board_id
       WHERE b.project_id = $1
       GROUP BY b.id`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new board
router.post('/', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { name, project_id } = req.body;
    if (!name || !project_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create board
    const boardResult = await client.query(
      'INSERT INTO boards (name, project_id) VALUES ($1, $2) RETURNING *',
      [name, project_id]
    );
    const newBoard = boardResult.rows[0];

    // Create default columns
    const columnNames = ['Backlog', 'In Progress', 'Testing', 'Done'];
    const columns = [];
    for (let i = 0; i < columnNames.length; i++) {
      const colRes = await client.query(
        'INSERT INTO columns (name, board_id, order_index) VALUES ($1, $2, $3) RETURNING *',
        [columnNames[i], newBoard.id, i]
      );
      columns.push(colRes.rows[0]);
    }

    // Add a sample task to Backlog
    const backlogColumn = columns[0];
    const taskRes = await client.query(
      'INSERT INTO tasks (title, description, column_id, order_index, priority, due_date, assignee_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        'User authentication',
        'Implement user authentication flow',
        backlogColumn.id,
        0,
        'high',
        new Date(new Date().setDate(new Date().getDate() + 7)),
        null
      ]
    );
    const sampleTask = taskRes.rows[0];

    // Attach tasks to columns
    columns[0].tasks = [sampleTask];
    columns[1].tasks = [];
    columns[2].tasks = [];
    columns[3].tasks = [];

    // Add the columns to the board
    newBoard.columns = columns;

    await client.query('COMMIT');
    res.status(201).json(newBoard);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Update board
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE boards SET name = $1 WHERE id = $2 RETURNING *',
      [name, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete board
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM boards WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder boards
router.put('/reorder', auth, async (req, res) => {
  try {
    const { boards } = req.body; // Array of { id, order_index }
    
    // Use a transaction to ensure all updates succeed or none do
    await pool.query('BEGIN');
    
    for (const board of boards) {
      await pool.query(
        'UPDATE boards SET order_index = $1 WHERE id = $2',
        [board.order_index, board.id]
      );
    }
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Boards reordered successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error reordering boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 