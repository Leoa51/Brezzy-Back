import express from 'express';
import conversationsController from '../controllers/conversation.controller.js';
import { body } from 'express-validator';
const Conversationrouter = express.Router();

Conversationrouter.post('/',body('participants').notEmpty().isArray(), conversationsController.createConversation);

Conversationrouter.get('/', conversationsController.getAllConversations);
Conversationrouter.get('/:id', conversationsController.getConversationById);
Conversationrouter.patch('/:id', conversationsController.modifyConversation);
Conversationrouter.delete('/:id', conversationsController.deleteConversation);

// Exportation du routeur
export default Conversationrouter;
