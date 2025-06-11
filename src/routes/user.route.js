import express from 'express';
import { body } from 'express-validator';
import usersController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.patch('/:id', usersController.modifyUser);
router.delete('/:id', usersController.deleteUser);

export default router;
