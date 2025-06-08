import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server as socketIO } from 'socket.io';
import { webSocketAuth } from './middleware/WebSocketAuth.js';
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
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
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

socketAuthMiddleware(io);


io.on('connection', (socket) => {
    console.log('A user connected');

    //map userId to socket.id
    const userId = socket.userId;
    usersSocketIds[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
});


socket.on('disconnect', () => {
    //remove userId from usersSocketIds
    const userId = socket.userId;
    delete usersSocketIds[userId];

    console.log('User disconnected');
});


io.on('message', (message, convId) => {
    //find conversation by convId
    console.log(`Message received: ${message} in conversation ${convId}`);
    mongoose.model('Conversation').findById(convId)
        .then(conversation => {
            if (!conversation) {
                console.error(`Conversation with id ${convId} not found`);
                return;
            }

            // Get all userIds from the conversation
            const userIds = conversation.users.map(user => user.userId);
            console.log(`Users in conversation ${convId}: ${userIds}`);

            // Emit the message to all users in the conversation
            userIds.forEach(userId => {
                if (usersSocketIds[userId]) {
                    io.to(usersSocketIds[userId]).emit('message', { message, convId });
                }
            });
        })
        .catch(err => {
            console.error(`Error finding conversation: ${err}`);
        });

    //emit the message to all userId from the conversation

    io.emit('message', { message, convId });
});