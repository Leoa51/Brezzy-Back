import Conversation from '../models/conversation.model.js';
import { validationResult } from 'express-validator';


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

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
    const conversation   = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).send("Conversation not found");

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).send("You are not in the conversation");
    }

    res.status(200).json(conversation);
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
  if (!message.content) return res.status(400).send("message content is required");

  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).send("Conversation not found");

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).send("You are not in the conversation");
    }

    // Ensure message has the required 'author' field according to schema validation
    const newMessage = {
      content: message.content,
      author: req.user.id, // Setting author from authenticated user
      timestamp: new Date()
    };

    // Add other fields if provided
    if (message.sender) newMessage.sender = message.sender;

    conversation.messages.push(newMessage);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    try {
      const recipientId = conversation.participants.find(id => id !== req.user.id);
      // const recipientId = req.user.id;
      if (recipientId) {
        const notificationBody = {
          title: 'New Message',
          body: 'You have received a new message',
          userId: recipientId
        };

        console.log(notificationBody)

        if ( req.body.url ) {
          notificationBody.url = req.body.url;
          console.log("notificationBody modifié : " + notificationBody)
        }
        else {
          console.log("notificationBody non modifié : " + notificationBody)
          notificationBody.url = '/';
        }

        await fetch(process.env.API_URI + `/api/notifications/send-to-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': req.headers.authorization },
          body: JSON.stringify(notificationBody)
        });
      }
    } catch (notificationError) {
      console.error("Notification delivery failed:", notificationError);
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).json({error: "Internal server error", message: err.message});
  }
}



