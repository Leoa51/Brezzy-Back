 
const express = require('express');
 
const router = express.Router();
 
const conversationsController = require('../controllers/conversation.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');

router.post('/', requiredFields(['participant']), conversationsController.createConversation);

router.post('/', conversationsController.createConversation);
 
router.get('/', conversationsController.getAllConversations);
 
router.get('/:id', conversationsController.getConversationById);

router.patch('/:id', conversationsController.modifyConversation);
 
router.delete('/:id', conversationsController.deleteConversation);
 
module.exports = router;