import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
dotenv.config();
const prisma = new PrismaClient();
export const isAuthenticated = (req, res) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.json({ authenticated: false });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ authenticated: true });
    } catch (err) {
        return res.json({ authenticated: false });
    }
};

export async function verifyUser(req, res) {
    const { id } = req.params;

    const user = await prisma.user_.findUnique(id);
    try {


        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.isValidated) {
            return res.status(200).json({
                success: true,
                message: 'User is already verified'
            });
        }
        prisma.user_.update({
            where: { id: parseInt(id) },
            data: {
                isValidated: true
            }
        })

        res.redirect(302, process.env.APP_URL);
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}