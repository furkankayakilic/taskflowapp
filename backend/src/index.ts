import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import path from 'path';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import teamRoutes from './routes/teams';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import boardsRoutes from './routes/boards';
import columnsRoutes from './routes/columns';
import attachmentsRoutes from './routes/attachments';
import commentsRoutes from './routes/comments';
import messageRoutes from './routes/messages';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    socket.data.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.data.userId);

  // Join user's personal room
  socket.join(socket.data.userId);

  // Handle new message
  socket.on('send_message', async (data) => {
    const { receiverId, content } = data;
    // Emit to receiver's room
    io.to(receiverId).emit('new_message', {
      senderId: socket.data.userId,
      content,
      createdAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.data.userId);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/columns', columnsRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});