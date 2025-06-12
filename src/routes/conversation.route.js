// Importation du module Express
const express = require('express');

// Création d'une nouvelle instance de Router pour définir les routes
const router = express.Router();

// Importe le contrôleur des tâches depuis le fichier conversations.controller.js
const conversationsController = require('../controllers/conversation.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');

router.post('/', requiredFields(['participant']), conversationsController.createConversation);

// Définition d'une route POST pour la racine du routeur
router.post('/', conversationsController.createConversation);

// Définition d'une route GET pour obtenir toutes les tâches
router.get('/', conversationsController.getAllConversations);

// Définition d'une route GET pour obtenir une tâche par son ID
router.get('/:id', conversationsController.getConversationById);

router.patch('/:id', conversationsController.modifyConversation);

// Définition d'une route DELETE pour supprimer une tâche par son ID
router.delete('/:id', conversationsController.deleteConversation);



// Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers
module.exports = router;