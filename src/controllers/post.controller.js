const Post = require('../models/post.model.js');

module.exports = {
    createPost: async (req, res) => {
        const { message, author } = req.body;
        if (!message || !author) return res.status(400).send("Title and content are required");
        try {
            const newPost = new Post({ message, author });
            await newPost.save();
            res.status(201).send("Post created successfully");
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    getAllPosts: async (req, res) => {
        try {
            const posts = await Post.find();
            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json(err);
        }
    },


    deletePost: async (req, res) => {
        try {
            const posts = await Post.findByIdAndDelete(req.params.id);
            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getPostById: async (req, res) => {
        try {
            const posts = await Post.findById(req.params.id);
            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    modifyPost: async (req, res) => {
        try {
            const posts = await Post.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};