import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import userManagementRoutes from './routes/userManagementRoutes';
import courseRoutes from './routes/courseRoutes';
import videoRoutes from './routes/videoRoutes';
import { connectDatabase } from './config/db';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400  // 24 hours
}));
app.use(express.json());

// Database connection
connectDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }
  
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    res.status(400).json({ error: 'Duplicate key error' });
    return;
  }

  // Default error response
  res.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);

export default app;
