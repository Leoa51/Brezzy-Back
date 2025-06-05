// Importation du module Express
const express = require('express');

// Création d'une nouvelle instance de Router pour définir les routes
const router = express.Router();

// Importe le contrôleur des tâches depuis le fichier tasks.controller.js
const tasksController = require('../controllers/tasks.controller.js');

// Définition d'une route POST pour la racine du routeur
router.post('/', tasksController.createTask);

// Définition d'une route GET pour obtenir toutes les tâches
router.get('/', tasksController.getAllTasks);

// Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers
module.exports = router;