import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import authMiddleware from './middleware/authMiddleware.js';
import { authRouter } from './routes/auth.route.js';
import minioRouter from './routes/minio.route.js';
import nodemailer from 'nodemailer'


dotenv.config();

const app = express();

const port = process.env.API_PORT


import tagsRouter from './routes/tag.route.js'
import postsRouter from './routes/post.route.js'
import usersRouter from './routes/user.route.js'
import conversationRouter from './routes/conversation.route.js'
import notificationsRouter from './routes/notification.route.js'

app.use(express.json());

switch (process.env.SERVICE) {
  case 'tags':
    app.use('/api/tags', authMiddleware, tagsRouter);
    break;
  case 'users':
    app.use('/api/users', authMiddleware, usersRouter);
  case 'posts':
    app.use('/api/posts', authMiddleware, postsRouter);
  case 'chat':
    app.use('/api/conversations', authMiddleware, conversationRouter);
  case 'auth':
    app.use('/api/auth', authRouter)
  case 'media':
    app.use('/api/media', authMiddleware, minioRouter);
  case 'notifications':
    app.use('/api/notifications', authMiddleware, notificationsRouter);
  default:
    app.use('/api/auth', authRouter)
    app.use('/api/conversations', authMiddleware, conversationRouter);
    app.use('/api/posts', authMiddleware, postsRouter);
    app.use('/api/users', authMiddleware, usersRouter);
    app.use('/api/tags', authMiddleware, tagsRouter);
    app.use('/api/media', authMiddleware, minioRouter);
    app.use('/api/notifications', authMiddleware, notificationsRouter);
    break;
}


mongoose
  .connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}?authSource=admin`)
  .then(() => {
    console.log("MongoDB connected !");
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});