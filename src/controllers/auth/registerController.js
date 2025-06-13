import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
const prisma = new PrismaClient();
export default async function register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password, name, firstName, bio, language, } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user_.create({ data: { username, email, name, bio, language, passwordHash: hashedPassword, firstName: firstName } });
        res.status(201).json({ message: 'User registered successfully', });
    } catch (err) {
        console.log((err))
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
}