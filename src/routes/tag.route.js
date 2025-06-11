import express from 'express';
import { body } from 'express-validator';
import tagsController from '../controllers/tag.controller.js';

const router = express.Router();


router.post('/',body('name').notEmpty().isString(), tagsController.createTag);
router.get('/', tagsController.getAllTags);
router.get('/:id', tagsController.getTagById);
router.patch('/:id', tagsController.modifyTag);
router.delete('/:id', tagsController.deleteTag);

export default router;
