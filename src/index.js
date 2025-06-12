import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from './middleware/authMiddleware.js';
//import tasksController from './controllers/tasks.controller.js';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.route.js';

import dotenv from "dotenv";
dotenv.config();

dotenv.config();
// Création d'une instance de l'application Express
const app = express();

// creation instance de prisma client

// Définition du port sur lequel le serveur écoutera les requêtes
const port = process.env.API_PORT




import tagsRouter from './routes/tag.route.js'
import postsRouter from './routes/post.route.js'
import usersRouter from './routes/user.route.js'
import conversationRouter from './routes/conversation.route.js'

app.use(express.json());

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
// });

app.use('/api/tags', tagsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationRouter);


app.use('/api', authRouter)
// Définition d'une route GET pour la racine du site ('/')


app.use(authMiddleware);
// Lorsque quelqu'un accède à cette route, une réponse "Hello World!" est envoyée
app.get('/', (req, res) => {
    res.send('Hello World!');
});


mongoose
    .connect(process.env.MONGO_URI)
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