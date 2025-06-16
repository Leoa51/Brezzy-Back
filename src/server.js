import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { webSocketAuth } from './middleware/WebSocketAuth.js';

import Conversation from './models/conversation.model.js';
dotenv.config();

const app = express();
const server = http.createServer(app);
mongoose
    // .connect("mongodb://" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DATABASE_NAME)
    .connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}?authSource=admin`)
    .then(() => {
        // Affiche un message de succès lorsque la connexion est établie.
        console.log("MongoDB connected !");

        // Démarre l'application sur le port spécifié.
    })
    .catch((err) => {
        // Affiche une erreur si la connexion échoue.
        console.log(err);
    });

const usersSocketIds = {};
const io = new Server(server, {
    cors: {
        origin: '*', // adapte selon tes besoins
        methods: ['GET', 'POST'],
    },
});

server.listen(3101, () => {
    console.log(`Server is running on port 3101 `);
});



io.on('connection', (socket) => {

    //map userIdn to socket.id
    const userId = 'cmby3db1i0000pp6cix0hk7nr';
    usersSocketIds[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);


    socket.on('disconnect', () => {
        //remove userId from usersSocketIds
        const userId = 1;
        delete usersSocketIds[userId];

        console.log('User disconnected');
    });

    socket.on('conversation', async (data) => {
        const participants = data.participants
        const newConversation = await Conversation.create({
            participants,
            messages: [],
        });

        const userIds = participants.map(p => p.toString());

        userIds.forEach(userId => {
            if (usersSocketIds[userId]) {
                io.to(usersSocketIds[userId]).emit('new_conversation', newConversation);
            }
        });
    })
    socket.on('new_message', async (data) => {
        const { conversationId, message, pictureUrl, videoUrl } = data;
        const author = "cmby3db1i0000pp6cix0hk7nr";

        console.log(usersSocketIds)
        console.log(data)


        if (!conversationId) {
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

            const userIds = conversation.participants.map(p => p.toString());
            userIds.forEach(userId => {
                console.log(userId)
                if (usersSocketIds[userId]) {
                    console.log('in')
                    io.to(usersSocketIds[userId]).emit('message', {
                        conversationId,
                        message: newMessage
                    });
                }
            });
        } catch (err) {
            console.error(`Error handling message: ${err.message}`);
        }
    });
});


