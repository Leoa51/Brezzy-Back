// Importation du module 'express' pour créer une application web
const express = require('express');

// Importe la bibliothèque Mongoose pour interagir avec MongoDB
const mongoose = require("mongoose");

require('dotenv').config();

// Création d'une instance de l'application Express
const app = express();

// Définition du port sur lequel le serveur écoutera les requêtes
const port = 3000;

app.use(express.json());

app.use('/api/tasks', require('./routes/tasks.route'));
app.use('/api/tags', require('./routes/tag.route'));
app.use('/api/posts', require('./routes/post.route'));
app.use('/api/users', require('./routes/user.route'));
app.use('/api/conversations', require('./routes/conversation.route'));

// Définition d'une route GET pour la racine du site ('/')
// Lorsque quelqu'un accède à cette route, une réponse "Hello World!" est envoyée
app.get('/', (req, res) => {
    res.send('Hello World!');
});


mongoose
    // .connect("mongodb://" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DATABASE_NAME)
    .connect(process.env.MONGO_URI)
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