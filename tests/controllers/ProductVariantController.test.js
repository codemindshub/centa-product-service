// test/ProductVariantController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('ProductVariantController', () => {
  let token;
  let userId;
  let productId;
  let variantId;

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

    // Create a product to associate with the variant
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
  });

  after(async () => {
    // Clean up the database
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('products').deleteMany({});
    await dbClient.db.collection('product_variants').deleteMany({});
    await redisClient.del(`auth_${token}`);
  });

  describe('POST /product-variants', () => {
    it('should create a new product variant', async () => {
      const res = await chai.request(app)
        .post('/product-variants')
        .set('x-token', token)
        .send({
          product: productId,
          variant_name: 'Color',
          variant_value: 'Red',
          brand: 'Test Brand',
          unit_price: 120.0,
          cost_price: 60.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      variantId = res.body.id;
    });
  });

  describe('GET /product-variants/:id', () => {
    it('should retrieve the product variant document', async () => {
      const res = await chai.request(app)
        .get(`/product-variants/${variantId}`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', variantId);
    });
  });

  describe('GET /product-variants', () => {
    it('should retrieve all product variants with pagination', async () => {
      const res = await chai.request(app)
        .get('/product-variants')
        .set('x-token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /product-variants/:id/delete', () => {
    it('should set is_deleted to true', async () => {
      const res = await chai.request(app)
        .put(`/product-variants/${variantId}/delete`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', true);
    });
  });

  describe('PUT /product-variants/:id/restore', () => {
    it('should set is_deleted to false', async () => {
      const res = await chai.request(app)
        .put(`/product-variants/${variantId}/restore`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', false);
    });
  });
});
