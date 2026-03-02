import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Get all attachments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM attachments WHERE task_id = $1 ORDER BY uploaded_at',
      [req.params.taskId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add attachment (URL-based, not file upload)
router.post('/', auth, async (req, res) => {
  try {
    const { task_id, name, url, type, size } = req.body;
    const result = await pool.query(
      'INSERT INTO attachments (task_id, name, url, type, size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [task_id, name, url, type, size, req.user?.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete attachment
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM attachments WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 