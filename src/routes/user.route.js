const express = require('express');
 
const router = express.Router();
 
const usersController = require('../controllers/user.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');
 
router.post('/', requiredFields(['role', 'username', 'name', 'email', 'password', 'bio', 'ppPath', 'language']), usersController.createUser);
 
router.get('/', usersController.getAllUsers);
 
router.get('/:id', usersController.getUserById);
 
router.patch('/:id', usersController.modifyUser);
 
router.delete('/:id', usersController.deleteUser);
 
module.exports = router;
