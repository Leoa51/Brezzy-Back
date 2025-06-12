const express = require('express');
 
const router = express.Router();
 
const usersController = require('../controllers/user.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');
 
router.post('/', requiredFields(['role', 'username', 'name', 'email', 'password', 'bio', 'ppPath', 'language']), usersController.createUser);
 
router.get('/', usersController.getAllUsers);

router.get('/by-username/:username', usersController.getUserByUsername);

router.patch('/:id/toggle-block', usersController.toggleBlockUser);

router.post('/toggle-follow', usersController.toggleFollowUser);

router.get('/:id/followers', usersController.getUserFollowers);

router.get('/:id/following', usersController.getUserFollowing);
 
router.get('/:id', usersController.getUserById);
 
router.patch('/:id', usersController.modifyUser);
 
router.delete('/:id', usersController.deleteUser);
 
module.exports = router;
