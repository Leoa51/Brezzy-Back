// Initialisation d'un tableau vide pour stocker les tâches.
const tasksList = [];


const Task = require('../models/tasks.model.js');

module.exports = {
    // Fonction asynchrone pour créer une nouvelle tâche.
    createTask: async (req, res) => {
        // Extraction des données de la requête : titre et contenu de la tâche.
        const { title, content } = req.body;

        // Vérification que le titre et le contenu sont présents.
        // Si l'un des deux est manquant, on retourne une réponse avec un statut 400 (Bad Request).
        if (!title || !content) return res.status(400).send("Title and content are required");

        try {
            // Création et sauvegarde d'une nouvelle tâche dans la base de données
            const newTask = new Task({ title, content });
            await newTask.save();

            // Envoi d'une réponse avec un statut 201 (Created) pour indiquer que la tâche a été créée avec succès.
            res.status(201).send("Task created successfully");
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            console.log(err);
            res.status(500).json(err);
        }
    },


    // Fonction asynchrone pour récupérer toutes les tâches.
    getAllTasks: async (req, res) => {
        try {
            // Récupération de toutes les tâches depuis la base de données
            const tasks = await Task.find();
            res.status(200).json(tasks);
        } catch (err) {
            // En cas d'erreur, envoi d'une réponse avec un statut 500 (Internal Server Error)
            // et l'erreur sous forme de JSON.
            res.status(500).json(err);
        }
    },
};