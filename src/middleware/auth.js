export const authMiddleware = (req, res, next) => {
    console.log("The request has reached the auth middleware");
    next();
}