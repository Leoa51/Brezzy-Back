import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
    }
});

const prisma = new PrismaClient();
export default async function register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password, name, firstName, bio, language, } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user_.create({ data: { username, email, name, bio, language, passwordHash: hashedPassword, firstName: firstName } });
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject: 'Verify your email',
            text: `hello please click on the following link to verify your email https://breezy-api.panini.simon511000.fr/api/auth/verify-user/${user.id}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error sending email: ', error);
            }
            console.log('Email sent: ', info.response);
        });
        res.redirect(201, 'https://breezy.panini.simon511000.fr/login');
    } catch (err) {
        console.log((err))
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
}