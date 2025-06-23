import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const userSubscriptions = new Map();

export async function subscribe(req, res) {
    try {
        const subscription = req.body;
        const userId = req.user.id;

        if (!userSubscriptions.has(userId)) {
            userSubscriptions.set(userId, []);
        }

        const userSubs = userSubscriptions.get(userId);
        const existingIndex = userSubs.findIndex(sub => sub.endpoint === subscription.endpoint);

        if (existingIndex === -1) {
            userSubs.push(subscription);
        } else {
            userSubs[existingIndex] = subscription;
        }

        res.status(201).json({ success: true, message: 'Subscription saved' });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ success: false, error: 'Failed to save subscription' });
    }
}

export async function sendNotification(req, res) {
    try {
        const { title, body, url } = req.body;
        let sentCount = 0;

        for (const [, subscriptions] of userSubscriptions.entries()) {
            if (subscriptions.length === 0) continue;

            const payload = JSON.stringify({
                title: title || 'Notification',
                body: body || 'You have a new notification',
                url: url || '/'
            });

            const promises = subscriptions.map(subscription =>
                webpush.sendNotification(subscription, payload)
                    .then(() => sentCount++)
                    .catch(error => {
                        if (error.statusCode === 410) {
                            const index = subscriptions.indexOf(subscription);
                            if (index > -1) {
                                subscriptions.splice(index, 1);
                            }
                        }
                    })
            );

            await Promise.all(promises);
        }

        if (sentCount === 0) {
            return res.status(400).json({
                success: false,
                error: 'No active subscriptions found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Notifications sent to ${sentCount} devices`
        });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ success: false, error: 'Failed to send notifications' });
    }
}

export async function sendNotificationToUser(req, res) {
    try {
        const { userId, title, body, url } = req.body;

        // Verify userId is provided
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required in the request body'
            });
        }

        const userSubs = userSubscriptions.get(userId) || [];

        if (userSubs.length === 0) {
            return res.status(400).json({
                success: false,
                error: `No subscriptions found for user with ID: ${userId}`
            });
        }

        const payload = JSON.stringify({
            title: title || 'Notification',
            body: body || 'You have a new notification',
            url: url || '/'
        });

        let sentCount = 0;
        const promises = userSubs.map(subscription =>
            webpush.sendNotification(subscription, payload)
                .then(() => sentCount++)
                .catch(error => {
                    if (error.statusCode === 410) {
                        const index = userSubs.indexOf(subscription);
                        if (index > -1) userSubs.splice(index, 1);
                    }
                })
        );

        await Promise.all(promises);
        res.status(200).json({
            success: true,
            message: `Notification sent to user ${userId} on ${sentCount} devices`
        });
    } catch (error) {
        console.error('Send user notification error:', error);
        res.status(500).json({ success: false, error: 'Failed to send notification to user' });
    }
}

export async function unsubscribe(req, res) {
    try {
        const { endpoint } = req.body;
        const userId = req.user.id;

        const userSubs = userSubscriptions.get(userId);

        if (!userSubs) {
            return res.status(404).json({ success: false, error: 'No subscriptions found for this user' });
        }

        const index = userSubs.findIndex(sub => sub.endpoint === endpoint);

        if (index > -1) {
            userSubs.splice(index, 1);
            res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Subscription not found' });
        }
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
    }
}