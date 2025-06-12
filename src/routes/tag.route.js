import express from 'express';


const tagRouter = express.Router();

import {
    createTag, getAllTags, getTagById, getTagByIdTag, modifyTag, deleteTag,
    getTrendingTags, searchTags, getTagStats, addTagToPost, removeTagFromPost
} from '../controllers/tag.controller.js'

// import { requiredFields } from '../middlewares/requiredFields.middleware.js'

// tagRouter.post('/', requiredFields(['name']), createTag);

tagRouter.post('/', createTag);

tagRouter.get('/', getAllTags);

tagRouter.get('/by-idTag/:idTag', getTagByIdTag);

tagRouter.get('/trending', getTrendingTags);

tagRouter.get('/search', searchTags);

tagRouter.get('/stats', getTagStats);

// tagRouter.post('/add-to-post', requiredFields(['tagId', 'postId', 'authorId']), addTagToPost);

tagRouter.post('/add-to-post', addTagToPost);

tagRouter.delete('/remove-from-post/:tagId/:postId', removeTagFromPost);

tagRouter.get('/:id', getTagById);

tagRouter.patch('/:id', modifyTag);

tagRouter.delete('/:id', deleteTag);

export default tagRouter;