// test/ProductsController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('ProductsController', () => {
  let token;
  let userId;
  let productId;

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
  });

  after(async () => {
    // Clean up the database
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('products').deleteMany({});
    await redisClient.del(`auth_${token}`);
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const res = await chai.request(app)
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
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      productId = res.body.id;
    });
  });

  describe('GET /products/:id', () => {
    it('should retrieve the product document', async () => {
      const res = await chai.request(app)
        .get(`/products/${productId}`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', productId);
    });
  });

  describe('GET /products', () => {
    it('should retrieve all products with pagination', async () => {
      const res = await chai.request(app)
        .get('/products')
        .set('x-token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /products/:id/delete', () => {
    it('should set is_deleted to true', async () => {
      const res = await chai.request(app)
        .put(`/products/${productId}/delete`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', true);
    });
  });

  describe('PUT /products/:id/restore', () => {
    it('should set is_deleted to false', async () => {
      const res = await chai.request(app)
        .put(`/products/${productId}/restore`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', false);
    });
  });

  describe('PUT /products/:id/update', () => {
    it('should update the product document', async () => {
      const res = await chai.request(app)
        .put(`/products/${productId}/update`)
        .set('x-token', token)
        .send({
          name: 'Updated Product',
          description: 'An updated test product',
          price: 150.0,
          cost_price: 75.0,
          updated_at: new Date().toISOString(),
        });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('name', 'Updated Product');
      expect(res.body).to.have.property('description', 'An updated test product');
      expect(res.body).to.have.property('price', 150.0);
      expect(res.body).to.have.property('cost_price', 75.0);
    });
  });
});
