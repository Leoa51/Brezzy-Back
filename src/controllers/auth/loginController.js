import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
import dotenv from 'dotenv';
dotenv.config();
export default async function (req, res) {
    const { email, password } = req.body;

    try {
        const user = await prisma.user_.findUnique({
            where: {
                email: email.toLowerCase(),
            }
        });
        // check if user is banned 
        if (user && user.isBlocked) {
            return res.status(403).json({ message: 'User is banned' });
        }
        // check if user verified his email
        if (!user.validated) {
            return res.status(403).json({ message: 'Please verify your email' });
        }
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ email: user.email, _id: user.id, }, process.env.JWT_SECRET, { expiresIn: '5d' });
        res.status(200).json({ token, message: 'Logged in successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};