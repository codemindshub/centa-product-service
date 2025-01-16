// test/InventoryTransferController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('InventoryTransferController', () => {
  let token;
  let userId;
  let productId;
  let originInventoryId;
  let destinationInventoryId;
  let transferId;

  before(async () => {
    // Set up a user and get a token
    const res = await chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' });
    userId = res.body.id;

    const authRes = await chai.request(app)
      .get('/connect')
      .auth('test@example.com', 'password');
    token = authRes.body.token;

    // Create a product to associate with the inventory
    const productRes = await chai.request(app)
      .post('/products')
      .set('x-token', token)
      .send({
        sku: 'test-sku',
        name: 'Test Product',
        description: 'A test product',
        price: 100.0,
        cost_price: 50.0,
        category: 'test-category',
        barcode: '123456789',
        max_stock_threshold: 100,
        min_stock_threshold: 10,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    productId = productRes.body.id;

    // Create origin inventory to associate with the transfer
    const originInventoryRes = await chai.request(app)
      .post('/inventories')
      .set('x-token', token)
      .send({
        product: productId,
        quantity: 100,
        quantity_reserved: 10,
        batch_number: 'batch-001',
        location: 'location-001',
        manufacturing_date: new Date().toISOString(),
        expiry_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    originInventoryId = originInventoryRes.body.id;

    // Create destination inventory to associate with the transfer
    const destinationInventoryRes = await chai.request(app)
      .post('/inventories')
      .set('x-token', token)
      .send({
        product: productId,
        quantity: 50,
        quantity_reserved: 5,
        batch_number: 'batch-002',
        location: 'location-002',
        manufacturing_date: new Date().toISOString(),
        expiry_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    destinationInventoryId = destinationInventoryRes.body.id;
  });

  after(async () => {
    // Clean up the database
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('products').deleteMany({});
    await dbClient.db.collection('inventories').deleteMany({});
    await dbClient.db.collection('inventory_transfers').deleteMany({});
    await redisClient.del(`auth_${token}`);
  });

  describe('POST /inventory-transfers', () => {
    it('should create a new inventory transfer', async () => {
      const res = await chai.request(app)
        .post('/inventory-transfers')
        .set('x-token', token)
        .send({
          product: productId,
          origin: originInventoryId,
          destination: destinationInventoryId,
          quantity: 20,
          transfer_type: 'INBOUND',
          tracking_number: 'tracking-001',
          status: 'PENDING',
          transfer_date: new Date().toISOString(),
          receipt_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          created_by: userId,
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      transferId = res.body.id;
    });
  });

  describe('GET /inventory-transfers/:id', () => {
    it('should retrieve the inventory transfer document', async () => {
      const res = await chai.request(app)
        .get(`/inventory-transfers/${transferId}`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', transferId);
    });
  });

  describe('GET /inventory-transfers', () => {
    it('should retrieve all inventory transfers with pagination', async () => {
      const res = await chai.request(app)
        .get('/inventory-transfers')
        .set('x-token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /inventory-transfers/:id/delete', () => {
    it('should set is_deleted to true', async () => {
      const res = await chai.request(app)
        .put(`/inventory-transfers/${transferId}/delete`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', true);
    });
  });

  describe('PUT /inventory-transfers/:id/restore', () => {
    it('should set is_deleted to false', async () => {
      const res = await chai.request(app)
        .put(`/inventory-transfers/${transferId}/restore`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', false);
    });
  });
});
