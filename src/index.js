import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import authMiddleware from './middleware/authMiddleware.js';
import { authRouter } from './routes/auth.route.js';
import tagsRouter from './routes/tag.route.js';
import postsRouter from './routes/post.route.js';
import Conversationrouter from './routes/conversation.route.js';

dotenv.config();

// Création d'une instance de l'application Express
const app = express();

// Définition du port sur lequel le serveur écoutera les requêtes
const port = process.env.API_PORT;

app.use(express.json());
app.use(cors({
    origin:'*',
}))
// Définition des routes
app.use('/api/tags',authMiddleware, tagsRouter);
app.use('/api/posts',authMiddleware, postsRouter);
app.use('/api/conversations',authMiddleware, Conversationrouter);
app.use('/api/auth', authRouter); // tu avais importé `authRouter` sans l'utiliser



// Connexion à MongoDB et lancement du serveur
mongoose
  .connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}?authSource=admin`)
  .then(() => {
    console.log('MongoDB connected !');
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
