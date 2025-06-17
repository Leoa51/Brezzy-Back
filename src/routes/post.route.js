import express from 'express';

const postRouter = express.Router();

import {
  createPost, getAllPosts, getPostById, modifyPost, deletePost, getPostComments, likePost,
  getAllPostFromFollowers
} from '../controllers/post.controller.js'
import { body, param } from 'express-validator';

import { isCuid } from '@paralleldrive/cuid2';
// import { requiredFields } from '../middlewares/requiredFields.middleware.js'

// postRouter.post('/', requiredFields(['message', 'author']), createPost);

postRouter.post('/', body('message').isString(), createPost); // TODO: Add media handling

postRouter.get('/', getAllPosts);

postRouter.get('/followers', getAllPostFromFollowers)

postRouter.get('/:id', param('id').custom(value => isCuid(value)), getPostById);

postRouter.patch('/:id', param('id').custom(value => isCuid(value)), modifyPost);

postRouter.delete('/:id', param('id').custom(value => isCuid(value)), deletePost);

postRouter.get('/comments/:postId', getPostComments);

postRouter.post('/like', body('postId').custom(value => isCuid(value)).notEmpty(), likePost);

export default postRouter;

