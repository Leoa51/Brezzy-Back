import express from 'express';

const userRouter = express.Router();

import {
    createUser, getAllUsers, getUserById, getUserByUsername, modifyUser, deleteUser,
    toggleBlockUser, toggleFollowUser, getUserFollowers, getUserFollowing
} from '../controllers/user.controller.js'

// import { requiredFields } from '../middlewares/requiredFields.middleware.js'

// userRouter.post('/', requiredFields(['username', 'name', 'email', 'password']), createUser);

userRouter.post('/', createUser);

userRouter.get('/', getAllUsers);

userRouter.get('/by-username/:username', getUserByUsername);

userRouter.patch('/:id/toggle-block', toggleBlockUser);

userRouter.post('/toggle-follow', toggleFollowUser);

userRouter.get('/:id/followers', getUserFollowers);

userRouter.get('/:id/following', getUserFollowing);

userRouter.get('/:id', getUserById);

userRouter.patch('/:id', modifyUser);

userRouter.delete('/:id', deleteUser);

export default userRouter;