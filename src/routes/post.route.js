import express from 'express';

const postRouter = express.Router();

import {
  createPost, getAllPosts, getPostById, modifyPost, deletePost, getPostComments, likePost,
  getAllPostFromFollowers, getIsLiked, getLikedPostsByUser
} from '../controllers/post.controller.js'
import { body, param, query } from 'express-validator';

import { isCuid } from '@paralleldrive/cuid2';

postRouter.post('/', body('message').isString().notEmpty(), createPost);

// enhanced search
postRouter.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("authorName").optional().isString(),
    query("keyword").optional().isString(),
    query("tag").optional().isString(),
  ],
  getAllPosts
);

postRouter.get('/followers', getAllPostFromFollowers)

postRouter.get('/:id', param('id').custom(value => isCuid(value)), getPostById);

postRouter.patch('/:id', param('id').custom(value => isCuid(value)), modifyPost);

postRouter.delete('/:id', param('id').custom(value => isCuid(value)), deletePost);

postRouter.get('/comments/:postId', getPostComments);

postRouter.post('/like', body('postId').custom(value => isCuid(value)).notEmpty(), likePost);

postRouter.get('/isLiked/:postId', param('postId').custom(value => isCuid(value)).notEmpty(), getIsLiked);

postRouter.get('/liked/:userId', param('userId').custom(value => isCuid(value)).notEmpty(), getLikedPostsByUser);

export default postRouter;

