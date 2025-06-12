// Initialisation d'un tableau vide pour stocker les tâches.
const tagsList = [];


const Tag = require('../models/tag.model.js');

module.exports = {
    // Fonction asynchrone pour créer une nouvelle tâche.
    createTag: async (req, res) => {
        // Extraction des données de la requête : titre et contenu de la tâche.
        const { name } = req.body;

        // Vérification que le titre et le contenu sont présents.
        // Si l'un des deux est manquant, on retourne une réponse avec un statut 400 (Bad Request).
        if (!name ) return res.status(400).send("Title and content are required");

        try {
            // Création et sauvegarde d'une nouvelle tâche dans la base de données
            const newTag = new Tag({ name });
            await newTag.save();

            // Envoi d'une réponse avec un statut 201 (Created) pour indiquer que la tâche a été créée avec succès.
            res.status(201).send("Tag created successfully");
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            console.log(err);
            res.status(500).json(err);
        }
    },


    // Fonction asynchrone pour récupérer toutes les tâches.
    getAllTags: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const tags = await Tag.find();
            res.status(200).json(tags);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },


    deleteTag: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const tags = await Tag.findByIdAndDelete(req.params.id);
            res.status(200).json(tags);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    getTagById: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const tags = await Tag.findById(req.params.id);
            res.status(200).json(tags);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

    modifyTag: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const tags = await Tag.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json(tags);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },

};