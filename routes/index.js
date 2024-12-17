// routes/index.js
import express from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController.js';
import ProductsController from '../controllers/ProductsController.js';

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/products', ProductsController.postUpload);
router.get('/products/:id', ProductsController.getShow);
router.get('/products', ProductsController.getIndex);
router.put('/products/:id/delete', ProductsController.putDelete);
router.put('/products/:id/restore', ProductsController.putRestore);
router.get('/products/:id/update', ProductsController.updatePut);

export default router;
