 
const express = require('express');
 
const router = express.Router();
 
const tagsController = require('../controllers/tag.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');
 
router.post('/', requiredFields(['name']), tagsController.createTag);
 
router.get('/', tagsController.getAllTags);
 
router.get('/:id', tagsController.getTagById);
 
router.patch('/:id', tagsController.modifyTag);
 
router.delete('/:id', tagsController.deleteTag);
 
module.exports = router;
