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

    try {
        const user = await prisma.user_.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.isValidated) {
            return res.status(200).json({ success: true, message: 'User is already verified' });
        }

        await prisma.user_.update({
            where: { id },
            data: { validated: true },
        });
        return res.redirect(302, 'https://breezy.panini.simon51100.fr');
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

