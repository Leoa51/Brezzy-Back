// Initialisation d'un tableau vide pour stocker les tâches.
const usersList = [];


const User = require('../models/user.model.js');

module.exports = {
    // Fonction asynchrone pour créer une nouvelle tâche.
    createUser: async (req, res) => {
        // Extraction des données de la requête : titre et contenu de la tâche.
        const { role, username, name, mail, password, bio, pp, language } = req.body;

        // Vérification que le titre et le contenu sont présents.
        // Si l'un des deux est manquant, on retourne une réponse avec un statut 400 (Bad Request).
        if (!role || !username || !name || !mail || !password || !bio || !pp || !language) return res.status(400).send("Title and content are required");

        try {
            // Création et sauvegarde d'une nouvelle tâche dans la base de données
            const newUser = new User({ role, username, name, mail, password, bio, pp, language });
            await newUser.save();

            // Envoi d'une réponse avec un statut 201 (Created) pour indiquer que la tâche a été créée avec succès.
            res.status(201).send("User created successfully");
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            console.log(err);
            res.status(500).json(err);
        }
    },


    // Fonction asynchrone pour récupérer toutes les tâches.
    getAllUsers: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const users = await User.find();
            res.status(200).json(users);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },


    deleteUser: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const users = await User.findByIdAndDelete(req.params.id);
            res.status(200).json(users);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    getUserById: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const users = await User.findById(req.params.id);
            res.status(200).json(users);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    modifyUser: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const users = await User.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json(users);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

};