import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import authMiddleware from './middleware/authMiddleware.js';
import { authRouter } from './routes/auth.route.js';

dotenv.config();

// Création d'une instance de l'application Express
const app = express();

// Définition du port sur lequel le serveur écoutera les requêtes
const port = process.env.API_PORT


import tagsRouter from './routes/tag.route.js'
import postsRouter from './routes/post.route.js'
import usersRouter from './routes/user.route.js'
import conversationRouter from './routes/conversation.route.js'

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));


switch (process.env.SERVICE) {
  case tags:
    app.use('/api/tags', authMiddleware, tagsRouter);
    break;
  case users:
    app.use('/api/users', authMiddleware, usersRouter);
  case posts:
    app.use('/api/posts', authMiddleware, postsRouter);
  case chat:
    app.use('/api/conversations', authMiddleware, conversationRouter);
  case auth:
    app.use('/api/auth', authRouter)
  default:
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