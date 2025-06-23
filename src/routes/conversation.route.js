import express from 'express';
const conversationRouter = express.Router();
import { isCuid } from '@paralleldrive/cuid2';
import {
    addMessageToConversation,
    createConversation, deleteConversation, getAllConversations, getConversationById, modifyConversation
} from '../controllers/conversation.controller.js'
import { body, param } from 'express-validator';
// import { requiredFields } from '../middlewares/requiredFields.middleware.js'

// conversationRouter.post('/', requiredFields(['participant']), createConversation);

conversationRouter.post('/', body('participants').isArray(), createConversation);

conversationRouter.get('/', getAllConversations);

conversationRouter.get('/:id', getConversationById);

conversationRouter.patch('/:id', param('id').isUUID(), modifyConversation);

conversationRouter.delete('/:id', deleteConversation);

conversationRouter.post('/add-message/:id', param('id').isUUID(), addMessageToConversation);

export default conversationRouter;