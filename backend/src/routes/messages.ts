import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/database';
import db from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface AuthenticatedRequest extends express.Request {
  user: {
    id: number;
    email: string;
  };
}

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Geçersiz dosya türü'));
    }
  }
});

// Start chat with user by email
router.post('/start-chat', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, name, email, avatar_url FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bu e-posta adresine sahip kullanıcı bulunamadı.' });
    }

    const targetUser = result.rows[0];

    // Check if trying to start chat with self
    if (targetUser.id === currentUserId) {
      return res.status(400).json({ message: 'Kendinizle sohbet başlatamazsınız.' });
    }

    // Return the user info
    res.json({
      user_id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      avatar_url: targetUser.avatar_url
    });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Sohbet başlatılırken bir hata oluştu.' });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END as user_id,
        u.name as user_name,
        u.avatar_url as user_avatar,
        (
          SELECT content 
          FROM messages 
          WHERE (sender_id = $1 AND receiver_id = u.id) 
             OR (sender_id = u.id AND receiver_id = $1)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages 
          WHERE (sender_id = $1 AND receiver_id = u.id) 
             OR (sender_id = u.id AND receiver_id = $1)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE sender_id = u.id 
            AND receiver_id = $1 
            AND is_read = false
        ) as unread_count
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END = u.id
      )
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY last_message_time DESC`,
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
        u.name as sender_name,
        u.avatar_url as sender_avatar,
        json_agg(
          CASE 
            WHEN ma.id IS NOT NULL THEN
              json_build_object(
                'id', ma.id,
                'name', ma.name,
                'url', ma.url,
                'type', ma.type,
                'size', ma.size
              )
            ELSE NULL
          END
        ) FILTER (WHERE ma.id IS NOT NULL) as attachments
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN message_attachments ma ON m.id = ma.message_id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       GROUP BY m.id, u.name, u.avatar_url
       ORDER BY m.created_at ASC`,
      [req.user?.id, req.params.userId]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
      [req.params.userId, req.user?.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message (with optional file attachment)
router.post('/:userId', auth, upload.single('file'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { content } = req.body;
    
    // Insert the message
    const messageResult = await client.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user?.id, req.params.userId, content || '']
    );
    
    const message = messageResult.rows[0];
    
    // If there's a file, add it as an attachment
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      
      await client.query(
        `INSERT INTO message_attachments (message_id, name, url, type, size, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          message.id,
          req.file.originalname,
          fileUrl,
          req.file.mimetype,
          req.file.size,
          req.user?.id
        ]
      );
      
      // Fetch the message with its attachment
      const finalResult = await client.query(
        `SELECT m.*, 
          json_agg(json_build_object(
            'id', ma.id,
            'name', ma.name,
            'url', ma.url,
            'type', ma.type,
            'size', ma.size
          )) as attachments
         FROM messages m
         LEFT JOIN message_attachments ma ON m.id = ma.message_id
         WHERE m.id = $1
         GROUP BY m.id`,
        [message.id]
      );
      
      await client.query('COMMIT');
      res.status(201).json(finalResult.rows[0]);
    } else {
      await client.query('COMMIT');
      res.status(201).json({ ...message, attachments: [] });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Mark all messages from a user as read
router.put('/:userId/read', auth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
      [req.params.userId, req.user?.id]
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 