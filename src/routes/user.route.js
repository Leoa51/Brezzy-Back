// Importation du module Express
const express = require('express');

// Création d'une nouvelle instance de Router pour définir les routes
const router = express.Router();

// Importe le contrôleur des utilisateurs depuis le fichier user.controller.js
const usersController = require('../controllers/user.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');

// Définition d'une route POST pour créer un nouvel utilisateur avec les champs obligatoires
router.post('/', requiredFields(['role', 'username', 'name', 'mail', 'password', 'bio', 'pp', 'language']), usersController.createUser);

// Définition d'une route GET pour obtenir tous les utilisateurs
router.get('/', usersController.getAllUsers);

// Définition d'une route GET pour obtenir un utilisateur par son ID
router.get('/:id', usersController.getUserById);

// Définition d'une route PATCH pour modifier un utilisateur existant
router.patch('/:id', usersController.modifyUser);

// Définition d'une route DELETE pour supprimer un utilisateur par son ID
router.delete('/:id', usersController.deleteUser);

// Exportation du routeur pour pouvoir l'utiliser dans d'autres fichiers
module.exports = router;
