export default function isBannedMiddleware(req, res, next) {
    if (req.user.isBanned) {
        return res.status(403).json({ message: 'Access forbidden. Your account is banned.' });
    }
    next();
}