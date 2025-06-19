import Conversation from '../models/conversation.model.js';
import { validationResult } from 'express-validator';

export async function createConversation(req, res) {
  console.log(req.body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { participants } = req.body;
  if (!participants) return res.status(400).send("participants is required");

  try {
    const newConversation = new Conversation({ participants });
    await newConversation.save();
    res.status(201).send("Conversation created successfully");
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

export async function getAllConversations(req, res) {
  try {

    const conversations = await Conversation.find({
      participants: req.user.id
    });

    res.status(200).json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

export async function getConversationById(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).send("Conversation not found");

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).send("You are not in the conversation");
    }

    console.log(conversation)
    return res.status(200).json(conversation);

  } catch (err) {
    res.status(500).json(err);
  }
}

export async function deleteConversation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).send("Conversation not found");

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).send("You are not in the conversation");
    }

    await Conversation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function modifyConversation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).send("Conversation not found");

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).send("You are not in the conversation");
    }

    const updated = await Conversation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function addMessageToConversation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { message } = req.body;
  if (!message) return res.status(400).send("message is required");

  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).send("Conversation not found");

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).send("You are not in the conversation");
    }

    conversation.messages.push(message);
    await conversation.save();
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
}
