import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Get all tasks for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
        c.name as column_name, 
        b.name as board_name, 
        p.name as project_name,
        json_agg(json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url
        )) as assignees
       FROM tasks t
       INNER JOIN columns c ON t.column_id = c.id
       INNER JOIN boards b ON c.board_id = b.id
       INNER JOIN projects p ON b.project_id = p.id
       INNER JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE pm.user_id = $1
       GROUP BY t.id, c.name, b.name, p.name`,
      [req.user?.id]
    );

    // Transform the tasks before sending
    const transformedTasks = result.rows.map(task => ({
      ...task,
      dueDate: task.due_date,
      columnId: task.column_id,
      assigneeId: task.assignee_id,
      createdBy: task.created_by,
      orderIndex: task.order_index,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));

    res.json(transformedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by date range
router.get('/calendar', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await pool.query(
      `SELECT t.*, 
        c.name as column_name, 
        b.name as board_name, 
        p.name as project_name,
        json_agg(json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url
        )) as assignees
       FROM tasks t
       INNER JOIN columns c ON t.column_id = c.id
       INNER JOIN boards b ON c.board_id = b.id
       INNER JOIN projects p ON b.project_id = p.id
       INNER JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE pm.user_id = $1
         AND t.due_date >= $2
         AND t.due_date <= $3
       GROUP BY t.id, c.name, b.name, p.name`,
      [req.user?.id, startDate, endDate]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, column_id, assignee_id, due_date, priority } = req.body;
    
    // Format the date for PostgreSQL if it exists
    const formattedDueDate = due_date ? new Date(due_date).toISOString() : null;
    
    const result = await pool.query(
      `INSERT INTO tasks (title, description, column_id, assignee_id, due_date, priority, created_by, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM tasks WHERE column_id = $3))
       RETURNING *`,
      [title, description, column_id, assignee_id, formattedDueDate, priority, req.user?.id]
    );

    // Transform the task before sending
    const task = result.rows[0];
    const transformedTask = {
      ...task,
      dueDate: task.due_date,
      columnId: task.column_id,
      assigneeId: task.assignee_id,
      createdBy: task.created_by,
      orderIndex: task.order_index,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };

    res.status(201).json(transformedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, column_id, assignee_id, due_date, priority } = req.body;
    
    // Format the date for PostgreSQL if it exists
    const formattedDueDate = due_date ? new Date(due_date).toISOString() : null;
    
    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, 
           description = $2, 
           column_id = $3, 
           assignee_id = $4, 
           due_date = $5, 
           priority = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description, column_id, assignee_id, formattedDueDate, priority, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Transform the task before sending
    const task = result.rows[0];
    const transformedTask = {
      ...task,
      dueDate: task.due_date,
      columnId: task.column_id,
      assigneeId: task.assignee_id,
      createdBy: task.created_by,
      orderIndex: task.order_index,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };

    res.json(transformedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder tasks
router.put('/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { id, column_id, order_index }
    
    // Use a transaction to ensure all updates succeed or none do
    await pool.query('BEGIN');
    
    for (const task of tasks) {
      await pool.query(
        'UPDATE tasks SET column_id = $1, order_index = $2 WHERE id = $3',
        [task.column_id, task.order_index, task.id]
      );
    }
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error reordering tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 