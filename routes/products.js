// routes/products.js
import express from 'express';

const router = express.Router();

// Define your routes here
router.get('/products', (request, response) => {
    response.send('List of products');
});

// Export the router as the default export
export default router;
