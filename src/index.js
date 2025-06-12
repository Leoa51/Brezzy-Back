import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from './middleware/authMiddleware.js';
//import tasksController from './controllers/tasks.controller.js';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.route.js';

dotenv.config();
// Création d'une instance de l'application Express
const app = express();

// creation instance de prisma client

// Définition du port sur lequel le serveur écoutera les requêtes
const port = process.env.API_PORT




app.use(express.json());
//app.use('/api/tasks', tasksController.getAllTasks); TODO:FIX by using prisma not mongoose

app.use('/api', authRouter)
// Définition d'une route GET pour la racine du site ('/')


app.use(authMiddleware);
// Lorsque quelqu'un accède à cette route, une réponse "Hello World!" est envoyée
app.get('/', (req, res) => {
    res.send('Hello World!');
});


mongoose
    // .connect("mongodb://" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DATABASE_NAME)
    .connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}?authSource=admin`)
    .then(() => {
        // Affiche un message de succès lorsque la connexion est établie.
        console.log("MongoDB connected !");

        // Démarre l'application sur le port spécifié.
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    })
    .catch((err) => {
        // Affiche une erreur si la connexion échoue.
        console.log(err);
    });



// Lancement du serveur pour écouter les requêtes sur le port spécifié
// Lorsque le serveur démarre, un message est affiché dans la console
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});