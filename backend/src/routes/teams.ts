import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Get all teams for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
        COUNT(DISTINCT tm2.user_id) as member_count,
        json_agg(json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url
        )) as members
       FROM teams t
       INNER JOIN team_members tm ON t.id = tm.team_id
       INNER JOIN users u ON tm.user_id = u.id
       LEFT JOIN team_members tm2 ON t.id = tm2.team_id
       WHERE tm.user_id = $1
       GROUP BY t.id`,
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
        COALESCE(json_agg(
          json_build_object(
            'id', u.id,
            'name', u.name,
            'avatarUrl', u.avatar_url,
            'email', u.email,
            'role', tm.role
          )
        ) FILTER (WHERE u.id IS NOT NULL), '[]') as members
       FROM teams t
       LEFT JOIN team_members tm ON t.id = tm.team_id
       LEFT JOIN users u ON tm.user_id = u.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new team
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    // Add creator as team admin
    await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, req.user?.id, 'admin']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'UPDATE teams SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete team
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM teams WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add team member
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const result = await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, userId, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove team member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite user to team by email
router.post('/:id/invite', auth, async (req, res) => {
  const { email, role } = req.body;
  try {
    // 1. Kullanıcıyı e-posta ile bul
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    // 2. Zaten takımda mı kontrol et
    const exists = await pool.query(
      'SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    // 3. Takıma ekle
    await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [req.params.id, userId, role || 'member']
    );
    res.json({ message: 'User added to team' });
  } catch (error) {
    console.error('Error inviting user by email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team projects
router.get('/:id/projects', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        COALESCE(json_agg(
          json_build_object(
            'id', u.id,
            'name', u.name,
            'avatarUrl', u.avatar_url,
            'role', pm.role
          )
        ) FILTER (WHERE u.id IS NOT NULL), '[]') as members
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE p.team_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team members
router.get('/:id/members', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        tm.id,
        tm.role,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'avatarUrl', u.avatar_url
        ) as user
       FROM team_members tm
       INNER JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.role DESC, u.name ASC`,
      [req.params.id]
    );

    // Her bir satır için user nesnesini düzgün formatta döndür
    const formattedMembers = result.rows.map(row => ({
      id: row.id,
      role: row.role,
      user: row.user
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 