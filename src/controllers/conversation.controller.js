import Conversation from '../models/conversation.model.js';

export default {
  createConversation: async (req, res) => {
    try {
      const newConversation = new Conversation({ participant });
      await newConversation.save();
      res.status(201).send('Conversation created successfully');
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
      const conversation = await Conversation.findByIdAndDelete(req.params.id);
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getConversationById: async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  modifyConversation: async (req, res) => {
    try {
      const conversation = await Conversation.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
};
