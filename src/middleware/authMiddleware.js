import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
dotenv.config();

export default function (req, res, next) {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = prisma.user.findUnique({
            where: {
                id: decoded._id,
            },
        });
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token', error: err.message });
    }
};