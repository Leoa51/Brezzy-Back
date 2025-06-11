const Conversation = require('../models/conversation.model.js');

module.exports = {
    createConversation: async (req, res) => {
        const { participant } = req.body;
        if (!participant) return res.status(400).send("participant is required");
        try {
            const newConversation = new Conversation({ participant });
            await newConversation.save();

            res.status(201).send("Conversation created successfully");
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    getAllConversations: async (req, res) => {
        try {
            const conversations = await Conversation.find();
            res.status(200).json(conversations);
        } catch (err) {
            res.status(500).json(err);
        }
    },


    deleteConversation: async (req, res) => {
        try {
            const conversations = await Conversation.findByIdAndDelete(req.params.id);
            res.status(200).json(conversations);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getConversationById: async (req, res) => {
        try {
            const conversations = await Conversation.findById(req.params.id);
            res.status(200).json(conversations);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    modifyConversation: async (req, res) => {
        try {
            const conversations = await Conversation.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json(conversations);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};