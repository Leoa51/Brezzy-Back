import express from 'express';

const postRouter = express.Router();

import {
  createPost, getAllPosts, getPostById, modifyPost, deletePost, getPostComments, likePost,
  getAllPostFromFollowers, getIsLiked, getLikedPostsByUser
} from '../controllers/post.controller.js'
import { body, param, query } from 'express-validator';

import { isCuid } from '@paralleldrive/cuid2';
import multer from "multer";
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

postRouter.post('/', upload.single('image'), body('message').isString(), createPost);

postRouter.get('/', getAllPosts);

postRouter.get('/followers', getAllPostFromFollowers)

postRouter.get('/:id', param('id').custom(value => isCuid(value)), getPostById);

postRouter.patch('/:id', param('id').custom(value => isCuid(value)), modifyPost);

postRouter.delete('/:id', param('id').custom(value => isCuid(value)), deletePost);

postRouter.get('/comments/:postId', getPostComments);

postRouter.post('/like', body('postId').custom(value => isCuid(value)).notEmpty(), likePost);

postRouter.get('/isLiked/:postId', param('postId').custom(value => isCuid(value)).notEmpty(), getIsLiked);

postRouter.get('/liked/:userId', param('userId').custom(value => isCuid(value)).notEmpty(), getLikedPostsByUser);

export default postRouter;

