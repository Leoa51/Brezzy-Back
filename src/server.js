import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Conversation from './models/conversation.model.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

mongoose
    .connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}?authSource=admin`)
    // .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected!");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

const usersSocketIds = {};

const io = new Server(server, {
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.headers['authorization'];

        if (!token) throw new Error('Token missing');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user_.findUnique({
            where: { id: decoded._id }
        });

        if (!user) throw new Error('User not found');
        socket.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.user.id;
    usersSocketIds[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
    console.log(usersSocketIds)
    socket.on('disconnect', () => {
        delete usersSocketIds[userId];
        console.log(`User ${userId} disconnected`);
    });

    socket.on('conversation', async (data) => {
        const participants = data;
        try {
            const newConversation = await Conversation.create({
                participants,
                messages: [],
            });
            newConversation.save()
            console.log('conv created')
            participants.forEach(participantId => {
                const pid = participantId.toString();
                if (usersSocketIds[pid]) {
                    io.to(usersSocketIds[pid]).emit('new_conversation', newConversation);
                }
            });
        } catch (err) {
            console.error('Error creating conversation:', err.message);
        }
    });

    socket.on('new_message', async (data) => {
        console.log(data)
        const { conversationId, message, pictureUrl, videoUrl } = data;
        const author = socket.user.id;

        if (!conversationId || !message) {
            console.error('Missing data to send message');
            return;
        }

        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                console.error(`Conversation with ID ${conversationId} not found`);
                return;
            }

            const newMessage = {
                author,
                content: message,
                pictureUrl: pictureUrl || '',
                videoUrl: videoUrl || '',
                isRead: false,
                sentAt: new Date()
            };

            conversation.messages.push(newMessage);
            await conversation.save();

            const userIds = conversation.participants

            userIds.forEach(uid => {
                if (usersSocketIds[uid]) {
                    console.log('send message')
                    io.to(usersSocketIds[uid]).emit('message', {
                        conversationId,
                        message: newMessage
                    });
                }
            });
        } catch (err) {
            console.error('Error handling message:', err.message);
        }
    });
});

server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
