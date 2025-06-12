import express from "express";

import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();
 
const app = express();
 
const port = 3000;

import tagsRouter from './routes/tag.route.js'
import postsRouter from './routes/post.route.js'
import usersRouter from './routes/user.route.js'
import conversationRouter from './routes/conversation.route.js'

app.use(express.json());

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
// });

app.use('/api/tags', tagsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationRouter);


app.get('/', (req, res) => {
    res.send('Hello World!');
});


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected !");
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
 
 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});