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
router.post('/files', ProductsController.postUpload);
router.get('/files/:id', ProductsController.getShow);
router.get('/files', ProductsController.getIndex);
router.put('/files/:id/publish', ProductsController.putPublish);
router.put('/files/:id/unpublish', ProductsController.putUnpublish);
router.get('/files/:id/data', ProductsController.getFile);

export default router;
