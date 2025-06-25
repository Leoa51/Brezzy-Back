export default async function (req, res, next) {
    if (req.user.validated) {
        return res.status(403).json({ message: 'Access forbidden. Your email is not verified please verify It.' });
    }
    next()
}