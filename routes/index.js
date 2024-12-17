// routes/index.js
import express from 'express';
import AppController from '../controllers/AppController.js';
import UserController from '../controllers/UserController.js';
import AuthController from '../controllers/AuthController.js';
import ProductsController from '../controllers/ProductsController.js';
import ProductVariantController from '../controllers/ProductVariantController.js';
import CategoryController from '../controllers/CategoryController.js';
import InventoryController from '../controllers/InventoryController.js';
import InventoryLogController from '../controllers/InventoryLogController.js';
import InventoryTransferController from '../controllers/InventoryTransferController.js';

const router = express.Router();
//app routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
//user routes
router.post('/users', UserController.postNew);
router.get('/users/me', UserController.getMe);
//auth routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
//products routes
router.post('/products', ProductsController.postUpload);
router.get('/products/:id', ProductsController.getShow);
router.get('/products', ProductsController.getIndex);
router.put('/products/:id/delete', ProductsController.putDelete);
router.put('/products/:id/restore', ProductsController.putRestore);
router.put('/products/:id/update', ProductsController.updatePut);
//product variant routes
router.post('/product-variants', ProductVariantController.postUpload);
router.get('/product-variants/:id', ProductVariantController.getShow);
router.get('/product-variants', ProductVariantController.getIndex);
router.put('/product-variants/:id/delete', ProductVariantController.putDelete);
router.put('/product-variants/:id/restore', ProductVariantController.putRestore);
//category routes
router.post('/categories', CategoryController.postUpload);
router.get('/categories/:id', CategoryController.getShow);
router.get('/categories', CategoryController.getIndex);
router.put('/categories/:id/delete', CategoryController.putDelete);
router.put('/categories/:id/restore', CategoryController.putRestore);
//inventory routes
router.post('/inventories', InventoryController.postUpload);
router.get('/inventories/:id', InventoryController.getShow);
router.get('/inventories', InventoryController.getIndex);
router.put('/inventories/:id/delete', InventoryController.putDelete);
router.put('/inventories/:id/restore', InventoryController.putRestore);
//inventory log routes
router.post('/inventory-logs', InventoryLogController.postUpload);
router.get('/inventory-logs/:id', InventoryLogController.getShow);
router.get('/inventory-logs', InventoryLogController.getIndex);
router.put('/inventory-logs/:id/delete', InventoryLogController.putDelete);
router.put('/inventory-logs/:id/restore', InventoryLogController.putRestore);
//inventory transfer routes
router.post('/inventory-transfers', InventoryTransferController.postUpload);
router.get('/inventory-transfers/:id', InventoryTransferController.getShow);
router.get('/inventory-transfers', InventoryTransferController.getIndex);
router.put('/inventory-transfers/:id/delete', InventoryTransferController.putDelete);
router.put('/inventory-transfers/:id/restore', InventoryTransferController.putRestore);

export default router;
