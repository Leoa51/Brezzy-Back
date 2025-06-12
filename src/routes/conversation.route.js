 
 import express from 'express';
const conversationRouter = express.Router();
 

import {
    createConversation, deleteConversation, getAllConversations, getConversationById, modifyConversation
} from '../controllers/conversation.controller.js'

// import { requiredFields } from '../middlewares/requiredFields.middleware.js'

// conversationRouter.post('/', requiredFields(['participant']), createConversation);

conversationRouter.post('/', createConversation);

conversationRouter.get('/', getAllConversations);

conversationRouter.get('/:id', getConversationById);

conversationRouter.patch('/:id', modifyConversation);

conversationRouter.delete('/:id', deleteConversation);
 
export default conversationRouter;