// Initialisation d'un tableau vide pour stocker les tâches.
const conversationsList = [];


const Conversation = require('../models/conversation.model.js');

module.exports = {
    // Fonction asynchrone pour créer une nouvelle tâche.
    createConversation: async (req, res) => {
        // Extraction des données de la requête : titre et contenu de la tâche.
        const { participant } = req.body;

        // Vérification que le titre et le contenu sont présents.
        // Si l'un des deux est manquant, on retourne une réponse avec un statut 400 (Bad Request).
        if (!participant) return res.status(400).send("participant is required");

        try {
            // Création et sauvegarde d'une nouvelle tâche dans la base de données
            const newConversation = new Conversation({ participant });
            await newConversation.save();

            // Envoi d'une réponse avec un statut 201 (Created) pour indiquer que la tâche a été créée avec succès.
            res.status(201).send("Conversation created successfully");
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            console.log(err);
            res.status(500).json(err);
        }
    },


    // Fonction asynchrone pour récupérer toutes les tâches.
    getAllConversations: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const conversations = await Conversation.find();
            res.status(200).json(conversations);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },


    deleteConversation: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const conversations = await Conversation.findByIdAndDelete(req.params.id);
            res.status(200).json(conversations);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    getConversationById: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const conversations = await Conversation.findById(req.params.id);
            res.status(200).json(conversations);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    modifyConversation: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const conversations = await Conversation.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json(conversations);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

};