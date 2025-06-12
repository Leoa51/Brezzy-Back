import express from 'express';

const postRouter = express.Router();

import {
    createPost, getAllPosts, getPostById, modifyPost, deletePost, getPostComments, likePost
} from '../controllers/post.controller.js'

// import { requiredFields } from '../middlewares/requiredFields.middleware.js'

// postRouter.post('/', requiredFields(['message', 'author']), createPost);

postRouter.post('/', createPost);

postRouter.get('/', getAllPosts);

postRouter.get('/:id', getPostById);

postRouter.patch('/:id', modifyPost);

postRouter.delete('/:id', deletePost);

postRouter.get('/comments/:postId', getPostComments);

postRouter.post('/like', likePost);

export default postRouter;