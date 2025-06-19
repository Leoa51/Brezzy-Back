import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

let subscriptions = [];

export async function subscribe(req, res) {
    try {
        const subscription = req.body;
        const existingIndex = subscriptions.findIndex(
            sub => sub.endpoint === subscription.endpoint
        );

        if (existingIndex === -1) {
            subscriptions.push(subscription);
        } else {
            subscriptions[existingIndex] = subscription;
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

        if (subscriptions.length === 0) {
            console.log('No subscriptions available for notification');
            return res.status(400).json({
                success: false,
                error: 'No active subscriptions found'
            });
        }

        const payload = JSON.stringify({
            title: title || 'Notification',
            body: body || 'You have a new notification',
            url: url || '/'
        });

        const promises = subscriptions.map(subscription =>
            webpush.sendNotification(subscription, payload)
                .catch(error => {
                    console.error('Individual notification failed:', error);
                    if (error.statusCode === 410) {
                        const index = subscriptions.indexOf(subscription);
                        if (index > -1) {
                            subscriptions.splice(index, 1);
                        }
                    }
                })
        );

        await Promise.all(promises);
        res.status(200).json({ success: true, message: 'Notifications sent' });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ success: false, error: 'Failed to send notifications' });
    }
}



export async function unsubscribe(req, res) {
    try {
        const { endpoint } = req.body;
        const index = subscriptions.findIndex(sub => sub.endpoint === endpoint);

        if (index > -1) {
            subscriptions.splice(index, 1);
            res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Subscription not found' });
        }
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
    }
}