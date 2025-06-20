import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

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