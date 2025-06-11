const express = require('express');

const mongoose = require("mongoose");

require('dotenv').config();
 
const app = express();
 
const port = 3000;

app.use(express.json());

app.use('/api/tags', require('./routes/tag.route'));
app.use('/api/posts', require('./routes/post.route'));
app.use('/api/users', require('./routes/user.route'));
app.use('/api/conversations', require('./routes/conversation.route'));

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