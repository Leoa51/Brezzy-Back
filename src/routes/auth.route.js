import express from 'express';
import { body } from 'express-validator';
import register from '../controllers/auth/registerController.js';
import login from '../controllers/auth/loginController.js';
import { isAuthenticated } from "../controllers/auth/authController.js";

export const authRouter = express.Router();

authRouter.post('/register',
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (req, res) => {
        register(req, res)
    }
);


authRouter.post('/login',
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res) => {
        login(req, res)
    }
);

authRouter.get('/verify-user/:id', verifyUser)
authRouter.get('/isauthenticated', isAuthenticated);

