import express from 'express';

const postRouter = express.Router();

import {
  createPost, getAllPosts, getPostById, modifyPost, deletePost, getPostComments, likePost
} from '../controllers/post.controller.js'
import { body, param } from 'express-validator';
// import { requiredFields } from '../middlewares/requiredFields.middleware.js'

// postRouter.post('/', requiredFields(['message', 'author']), createPost);

postRouter.post('/', body('message').isString(), body('originalPostId').custom(value => isCuid(value)), body('parentCommentId').custom(value => isCuid(value)), createPost); // TODO: Add media handling

postRouter.get('/', getAllPosts);

postRouter.get('/:id', param('postid').custom(value => isCuid(value)), getPostById);

postRouter.patch('/:id', param('postid').custom(value => isCuid(value)), modifyPost);

postRouter.delete('/:id', param('postid').custom(value => isCuid(value)), deletePost);

postRouter.get('/comments/:postId', getPostComments);

postRouter.post('/like', body('postid').custom(value => isCuid(value)), likePost);

export default postRouter;