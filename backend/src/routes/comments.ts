import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Get all comments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at`,
      [req.params.taskId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/', auth, async (req, res) => {
  try {
    const { task_id, content } = req.body;
    const result = await pool.query(
      'INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [task_id, req.user?.id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user?.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found or not authorized' });
    }
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 