// Importation du module Express
const express = require('express');

// Création d'une nouvelle instance de Router pour définir les routes
const router = express.Router();

// Importe le contrôleur des tâches depuis le fichier posts.controller.js
const postsController = require('../controllers/post.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');

router.post('/', requiredFields(['message', 'author']), postsController.createPost);

// Définition d'une route POST pour la racine du routeur
router.post('/', postsController.createPost);

// Définition d'une route GET pour obtenir toutes les tâches
router.get('/', postsController.getAllPosts);

// Définition d'une route GET pour obtenir une tâche par son ID
router.get('/:id', postsController.getPostById);

router.patch('/:id', postsController.modifyPost);

// Définition d'une route DELETE pour supprimer une tâche par son ID
router.delete('/:id', postsController.deletePost);



// Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers
module.exports = router;