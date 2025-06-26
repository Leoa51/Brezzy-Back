import express from 'express';

const userRouter = express.Router();
import { isCuid } from '@paralleldrive/cuid2';
import {
    createUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    modifyUser,
    modifyUserProfile,
    deleteUser,
    toggleBlockUser,
    toggleFollowUser,
    getUserFollowers,
    getUserFollowing,
    getUserInfoById,
    getUserMessages,
    getMe,
    blockUser,
    unblockUser,
    updateProfilePicture,
    getIsFollowing,
    getReportedUser,
    getBannedUser,
    reportUser,
} from '../controllers/user.controller.js'

import { body, param } from 'express-validator';
import multer from "multer";
import path from "path";
import roleMiddleware from '../middleware/roleMiddleware.js'
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
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

userRouter.get('/reportedUser', roleMiddleware(['adminstrator', 'moderator']), getReportedUser)

userRouter.get('/me', getMe)

userRouter.get('/bannedUser', roleMiddleware(['adminstrator', 'moderator']), getBannedUser)

userRouter.post('/', body('username').isString(), body('name').isString().notEmpty(), body('firstName').isString().notEmpty(), body('email').isEmail().notEmpty(), body('password').isStrongPassword().notEmpty(), body('bio').isString(), body('language').isString().notEmpty(), createUser);

userRouter.get('/', getAllUsers);

userRouter.get('/by-username/:username', param('username').isString().notEmpty(), getUserByUsername);

userRouter.patch('/:id/toggle-block', ['adminstrator', 'moderator'], param('id').custom(value => isCuid(value)), toggleBlockUser);

userRouter.post('/toggle-follow', toggleFollowUser);

userRouter.get('/isFollowing/:id', getIsFollowing)

userRouter.get('/:id/followers', param('id').custom(value => isCuid(value)), getUserFollowers);

userRouter.get('/:id/following', param('id').custom(value => isCuid(value)), getUserFollowing);

userRouter.get('/:id', param('id').custom(value => isCuid(value)), getUserById);

userRouter.get('/profile-info/:id', param('id').custom(value => isCuid(value)), getUserInfoById);

userRouter.patch('/modify-profile', modifyUserProfile);

userRouter.patch('/:id', param('id').custom(value => isCuid(value)), modifyUser);

userRouter.delete('/:id', param('id').custom(value => isCuid(value)), deleteUser);

userRouter.get('/user-messages/:id', getUserMessages);

userRouter.post('/:id/report', [
    param('id').isString().notEmpty().withMessage('userId is required'), body('reason').optional().isString().withMessage('Reason must be a string')
], reportUser);

userRouter.post('/block', ['adminstrator', 'moderator'], blockUser);

userRouter.post('/unblock', ['adminstrator', 'moderator'], unblockUser);

userRouter.put('/profile-picture', upload.single('profilePicture'), updateProfilePicture);


export default userRouter;