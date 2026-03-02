import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';

const router = express.Router();

// Get all projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        t.name as team_name,
        json_agg(json_build_object(
          'id', b.id,
          'name', b.name,
          'columns', (
            SELECT json_agg(json_build_object(
              'id', c.id,
              'name', c.name,
              'tasks', (
                SELECT json_agg(json_build_object(
                  'id', t.id,
                  'title', t.title,
                  'description', t.description,
                  'due_date', t.due_date,
                  'priority', t.priority,
                  'assignee_id', t.assignee_id
                ))
                FROM tasks t
                WHERE t.column_id = c.id
              )
            ))
            FROM columns c
            WHERE c.board_id = b.id
          )
        )) as boards
       FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN teams t ON p.team_id = t.id
       LEFT JOIN boards b ON p.id = b.project_id
       WHERE pm.user_id = $1
       GROUP BY p.id, t.name`,
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        t.name as team_name,
        json_agg(json_build_object(
          'id', b.id,
          'name', b.name,
          'columns', (
            SELECT json_agg(json_build_object(
              'id', c.id,
              'name', c.name,
              'tasks', (
                SELECT json_agg(json_build_object(
                  'id', t.id,
                  'title', t.title,
                  'description', t.description,
                  'due_date', t.due_date,
                  'priority', t.priority,
                  'assignee_id', t.assignee_id
                ))
                FROM tasks t
                WHERE t.column_id = c.id
              )
            ))
            FROM columns c
            WHERE c.board_id = b.id
          )
        )) as boards,
        json_agg(json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url,
          'role', pm.role
        )) as members
       FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN teams t ON p.team_id = t.id
       LEFT JOIN boards b ON p.id = b.project_id
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE p.id = $1
       GROUP BY p.id, t.name`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, team_id } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, description, team_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, team_id, req.user?.id]
    );

    // Add creator as project owner
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, req.user?.id, 'owner']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, team_id } = req.body;
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2, team_id = $3 WHERE id = $4 RETURNING *',
      [name, description, team_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add project member
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const result = await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, userId, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove project member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project member not found' });
    }

    res.json({ message: 'Project member removed successfully' });
  } catch (error) {
    console.error('Error removing project member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 