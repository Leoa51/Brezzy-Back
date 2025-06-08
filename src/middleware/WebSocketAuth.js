import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function webSocketAuth(io) {
    io.use((socket, next) => {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization;

        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }

        try {
            const cleanToken = token.replace('Bearer ', '');
            const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

            socket.userId = decoded.id;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });
}
