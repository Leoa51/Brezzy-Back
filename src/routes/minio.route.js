import express from 'express';
import multer from 'multer';
import path from 'path';
import {
   resizeImage,
   uploadImage,
   getImage,
   deleteImage,
   getAllImages,
   clearCache
} from '../controllers/minio.controller.js';
import { param } from 'express-validator';

const minioRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
   storage,
   limits: { fileSize: 10 * 1024 * 1024 },
   fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = allowedTypes.test(file.mimetype);
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
         return cb(null, true);
      } else {
         cb(new Error('Unsupported file type'));
      }
   }
});

minioRouter.post('/upload', upload.single('image'), uploadImage);


minioRouter.get('/resize/:width/:height/:year/:month/:day/:filename', [
   param('width').isInt({ min: 1, max: 2048 }).withMessage('Width must be between 1 and 2048'),
   param('height').isInt({ min: 1, max: 2048 }).withMessage('Height must be between 1 and 2048'),
   param('year').isNumeric().withMessage('Year must be numeric'),
   param('month').isNumeric().withMessage('Month must be numeric'),
   param('day').isNumeric().withMessage('Day must be numeric'),
   param('filename').notEmpty().withMessage('Filename is required')
], resizeImage);

minioRouter.get('/all', getAllImages);

minioRouter.delete('/cache', clearCache);

minioRouter.get('/:year/:month/:day/:filename', [
   param('year').isNumeric().withMessage('Year must be numeric'),
   param('month').isNumeric().withMessage('Month must be numeric'),
   param('day').isNumeric().withMessage('Day must be numeric'),
   param('filename').notEmpty().withMessage('Filename is required')
], getImage);

minioRouter.delete('/:year/:month/:day/:filename', [
   param('year').isNumeric().withMessage('Year must be numeric'),
   param('month').isNumeric().withMessage('Month must be numeric'),
   param('day').isNumeric().withMessage('Day must be numeric'),
   param('filename').notEmpty().withMessage('Filename is required')
], deleteImage);

export default minioRouter;