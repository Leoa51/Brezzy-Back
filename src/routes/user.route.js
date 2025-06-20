import express from 'express';

const userRouter = express.Router();
import { isCuid } from '@paralleldrive/cuid2';
import {
    createUser, getAllUsers, getUserById, getUserByUsername, modifyUser, deleteUser,
    toggleBlockUser, toggleFollowUser, getUserFollowers, getUserFollowing, getUserInfoById, getUserMessages, getMe, blockUser, unblockUser, getIsFollowing
} from '../controllers/user.controller.js'

import { body, param } from 'express-validator';

userRouter.get('/me', getMe)
userRouter.post('/', body('username').isString(), body('name').isString().notEmpty(), body('firstName').isString().notEmpty(), body('email').isEmail().notEmpty(), body('password').isStrongPassword().notEmpty(), body('bio').isString(), body('language').isString().notEmpty(), createUser);

userRouter.get('/', getAllUsers);

userRouter.get('/by-username/:username', param('username').isString().notEmpty(), getUserByUsername);

userRouter.patch('/:id/toggle-block', param('id').custom(value => isCuid(value)), toggleBlockUser);

userRouter.post('/toggle-follow', toggleFollowUser);

userRouter.get('/isFollowing/:id', getIsFollowing)

userRouter.get('/:id/followers', param('id').custom(value => isCuid(value)), getUserFollowers);

userRouter.get('/:id/following', param('id').custom(value => isCuid(value)), getUserFollowing);

userRouter.get('/:id', param('id').custom(value => isCuid(value)), getUserById);

userRouter.get('/profile-info/:id', param('id').custom(value => isCuid(value)), getUserInfoById);

userRouter.patch('/:id', param('id').custom(value => isCuid(value)), modifyUser);

userRouter.delete('/:id', param('id').custom(value => isCuid(value)), deleteUser);

userRouter.get('/user-messages/:id', getUserMessages);
userRouter.post('/block', blockUser);

userRouter.post('/unblock', unblockUser);

export default userRouter;