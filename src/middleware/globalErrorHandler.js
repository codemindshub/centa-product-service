export const errorMiddleware = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        name: err.name || `Error`,
        message: err.message || 'Internal Server error',
        statusCode: err.statusCode || 500,
    });
    console.error(err); // for debugging
}
