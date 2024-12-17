// test/InventoryLogController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('InventoryLogController', () => {
  let token;
  let userId;
  let productId;
  let inventoryId;
  let logId;

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

    // Create an inventory to associate with the log
    const inventoryRes = await chai.request(app)
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
    inventoryId = inventoryRes.body.id;
  });

  after(async () => {
    // Clean up the database
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('products').deleteMany({});
    await dbClient.db.collection('inventories').deleteMany({});
    await dbClient.db.collection('inventory_logs').deleteMany({});
    await redisClient.del(`auth_${token}`);
  });

  describe('POST /inventory-logs', () => {
    it('should create a new inventory log', async () => {
      const res = await chai.request(app)
        .post('/inventory-logs')
        .set('x-token', token)
        .send({
          inventory: inventoryId,
          type: 'IN',
          quantity: 50,
          created_by: userId,
          movement_reason: 'Restock',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      logId = res.body.id;
    });
  });

  describe('GET /inventory-logs/:id', () => {
    it('should retrieve the inventory log document', async () => {
      const res = await chai.request(app)
        .get(`/inventory-logs/${logId}`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', logId);
    });
  });

  describe('GET /inventory-logs', () => {
    it('should retrieve all inventory logs with pagination', async () => {
      const res = await chai.request(app)
        .get('/inventory-logs')
        .set('x-token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /inventory-logs/:id/delete', () => {
    it('should set is_deleted to true', async () => {
      const res = await chai.request(app)
        .put(`/inventory-logs/${logId}/delete`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', true);
    });
  });

  describe('PUT /inventory-logs/:id/restore', () => {
    it('should set is_deleted to false', async () => {
      const res = await chai.request(app)
        .put(`/inventory-logs/${logId}/restore`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', false);
    });
  });
});
