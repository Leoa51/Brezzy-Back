const express = require('express');
 
const router = express.Router();
 
const tagsController = require('../controllers/tag.controller.js');

const requiredFields = require('../middlewares/requiredFields.middleware.js');
 
router.post('/', requiredFields(['name']), tagsController.createTag);
 
router.get('/', tagsController.getAllTags);

router.get('/by-idTag/:idTag', tagsController.getTagByIdTag);

router.get('/trending', tagsController.getTrendingTags);

router.get('/search', tagsController.searchTags);

router.get('/stats', tagsController.getTagStats);

router.post('/add-to-post', requiredFields(['tagId', 'postId', 'authorId']), tagsController.addTagToPost);

router.delete('/remove-from-post/:tagId/:postId', tagsController.removeTagFromPost);

router.get('/:id', tagsController.getTagById);
 
router.patch('/:id', tagsController.modifyTag);
 
router.delete('/:id', tagsController.deleteTag);
 
module.exports = router;
