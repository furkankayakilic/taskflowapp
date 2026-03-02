import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Get all columns for a board
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
        json_agg(json_build_object(
          'id', t.id,
          'title', t.title,
          'description', t.description,
          'due_date', t.due_date,
          'priority', t.priority,
          'assignee_id', t.assignee_id,
          'order_index', t.order_index
        )) as tasks
       FROM columns c
       LEFT JOIN tasks t ON c.id = t.column_id
       WHERE c.board_id = $1
       GROUP BY c.id
       ORDER BY c.order_index`,
      [req.params.boardId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new column
router.post('/', auth, async (req, res) => {
  try {
    console.log('Column create body:', req.body);
    const { name, board_id, order_index } = req.body;
    if (!name || !board_id || order_index === undefined) {
      return res.status(400).json({ message: 'Missing required fields: name, board_id, order_index' });
    }
    const result = await pool.query(
      'INSERT INTO columns (name, board_id, order_index) VALUES ($1, $2, $3) RETURNING *',
      [name, board_id, order_index]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update column
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, order_index } = req.body;
    const result = await pool.query(
      'UPDATE columns SET name = $1, order_index = $2 WHERE id = $3 RETURNING *',
      [name, order_index, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Column not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete column
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM columns WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Column not found' });
    }

    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder columns
router.put('/reorder', auth, async (req, res) => {
  try {
    const { columns } = req.body; // Array of { id, order_index }
    
    // Use a transaction to ensure all updates succeed or none do
    await pool.query('BEGIN');
    
    for (const column of columns) {
      await pool.query(
        'UPDATE columns SET order_index = $1 WHERE id = $2',
        [column.order_index, column.id]
      );
    }
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Columns reordered successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error reordering columns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 