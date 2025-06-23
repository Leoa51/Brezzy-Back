import express from 'express';
const notificationRouter = express.Router();
import {
    subscribe,
    sendNotification,
    unsubscribe,
    sendNotificationToUser
} from '../controllers/notification.controller.js';

notificationRouter.post('/subscribe',  subscribe);
notificationRouter.post('/send-to-user',  sendNotificationToUser);
notificationRouter.post('/send', sendNotification);
notificationRouter.delete('/unsubscribe', unsubscribe);

export default notificationRouter;