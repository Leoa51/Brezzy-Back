import express from 'express';
import { body } from 'express-validator';
import register from '../controllers/auth/registerController.js';
import login from '../controllers/auth/loginController.js';
import {isAuthenticated} from "../controllers/auth/authController.js";
export const authRouter = express.Router();

authRouter.post('/register',
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (req, res) => {
        register(req, res)
    }
);


// authRouter.post('/register', [
//     body('email').isEmail().withMessage('Enter a valid email'),
//     body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
//     body('username').isLength({ min: 3 }).withMessage('Username must contain at least 3 characters'),
//     body('firstName').notEmpty().withMessage('First name is required'),
//     body('name').notEmpty().withMessage('Last name is required'),
//     body('language').notEmpty().withMessage('Please select a language')
// ], register);

authRouter.post('/login',
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res) => {
        login(req, res)
    }
);

authRouter.get('/isauthenticated', isAuthenticated);