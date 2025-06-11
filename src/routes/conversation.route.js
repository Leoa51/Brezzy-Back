import express from 'express';
import conversationsController from '../controllers/conversation.controller.js';
import { body } from 'express-validator';
const router = express.Router();

router.post('/',body('participants').notEmpty().isArray(), conversationsController.createConversation);

router.get('/', conversationsController.getAllConversations);
router.get('/:id', conversationsController.getConversationById);
router.patch('/:id', conversationsController.modifyConversation);
router.delete('/:id', conversationsController.deleteConversation);

// Exportation du routeur
export default Conversationrouter;
