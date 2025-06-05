// Importation du module Express
const express = require('express');

// Création d'une nouvelle instance de Router pour définir les routes
const router = express.Router();

// Importe le contrôleur des tags depuis le fichier tag.controller.js
const tagsController = require('../controllers/tag.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');

// Définition d'une route POST pour créer un nouveau tag avec les champs obligatoires
router.post('/', requiredFields(['name']), tagsController.createTag);

// Définition d'une route GET pour obtenir tous les tags
router.get('/', tagsController.getAllTags);

// Définition d'une route GET pour obtenir un tag par son ID
router.get('/:id', tagsController.getTagById);

// Définition d'une route PATCH pour modifier un tag existant
router.patch('/:id', tagsController.modifyTag);

// Définition d'une route DELETE pour supprimer un tag par son ID
router.delete('/:id', tagsController.deleteTag);

// Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers
module.exports = router;
