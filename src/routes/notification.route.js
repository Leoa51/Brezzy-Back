import express from 'express';
const notificationRouter = express.Router();
import {
    subscribe, sendNotification, unsubscribe
} from '../controllers/notification.controller.js';

notificationRouter.post('/subscribe', subscribe);
notificationRouter.post('/send', sendNotification);
notificationRouter.delete('/unsubscribe', unsubscribe);

export default notificationRouter;