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

<<<<<<< Updated upstream
app.use('/api/tasks', require('./routes/tasks.route'));
=======
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));


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
  default:
    app.use('/api/auth', authRouter)
    app.use('/api/conversations', authMiddleware, conversationRouter);
    app.use('/api/posts', authMiddleware, postsRouter);
    app.use('/api/users', authMiddleware, usersRouter);
    app.use('/api/tags', authMiddleware, tagsRouter);
    break;
}
>>>>>>> Stashed changes

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

// mongoose
//     .connect(process.env.MONGO_URI, {
//         // Options recommandées pour MongoDB Atlas
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
//     .then(() => {
//         console.log("✅ MongoDB Atlas connected successfully!");
//         console.log(`📊 Database: ${mongoose.connection.name}`);
//
//         // Démarre l'application seulement après connexion réussie
//         app.listen(port, () => {
//             console.log(`🚀 Server running on port ${port}`);
//             console.log(`📅 Started at: ${new Date().toISOString()}`);
//         });
//     })
//     .catch((err) => {
//         console.error("❌ MongoDB connection error:", err.message);
//         process.exit(1); // Arrête l'application si pas de connexion DB
//     });

// Lancement du serveur pour écouter les requêtes sur le port spécifié
// Lorsque le serveur démarre, un message est affiché dans la console
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});