 
const express = require('express');
 
const router = express.Router();
 
const postsController = require('../controllers/post.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');

router.post('/', requiredFields(['message', 'author']), postsController.createPost);

router.post('/', postsController.createPost);

router.get('/', postsController.getAllPosts);

router.get('/:id', postsController.getPostById);

router.patch('/:id', postsController.modifyPost);

router.delete('/:id', postsController.deletePost);



module.exports = router;