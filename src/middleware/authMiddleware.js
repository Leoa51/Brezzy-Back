import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
dotenv.config();

export default async function authMiddleware(req, res, next) {
    console.log(req.header('Authorization'));
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await prisma.user_.findUnique({
            where: {
                id: decoded._id,
            },
        });
        return next();
    } catch (err) {
        return res.status(400).json({ message: 'Invalid token', error: err.message });
    }
}
