import express from 'express';
import { body } from 'express-validator';
import postsController from '../controllers/post.controller.js';

const router = express.Router();



// Routes
router.post('/',body('message').notEmpty().isString().trim(),
  body('author').notEmpty().isInt(), postsController.createPost);

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.patch('/:id', postsController.modifyPost);
router.delete('/:id', postsController.deletePost);

export default router;
