import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Protected route - Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, avatar_url',
      [name, email, req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user avatar
router.put('/me/avatar', auth, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url',
      [avatarUrl, req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/me/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user?.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for team member invitation and chat)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url, created_at 
       FROM users 
       WHERE id != $1
       ORDER BY name ASC`,
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific user
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 