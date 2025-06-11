import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
const prisma = new PrismaClient();
export default async function register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    console.log(req.body)
    const { username, email, password, name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { username, email, name, passwordHash: hashedPassword } });
        res.status(201).json({ message: 'User registered successfully', user: user });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
}