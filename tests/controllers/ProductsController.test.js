// test/productsController.test.js
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
          name: 'testproduct.txt',
          type: 'product',
          data: Buffer.from('Hello, world!').toString('base64'),
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

  describe('PUT /products/:id/publish', () => {
    it('should set is_deleted to true', async () => {
      const res = await chai.request(app)
        .put(`/products/${productId}/publish`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', true);
    });
  });

  describe('PUT /products/:id/unpublish', () => {
    it('should set is_deleted to false', async () => {
      const res = await chai.request(app)
        .put(`/products/${productId}/unpublish`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', false);
    });
  });

  describe('GET /products/:id/data', () => {
    it('should return the content of the product', async () => {
      const res = await chai.request(app)
        .get(`/products/${productId}/data`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.text).to.equal('Hello, world!');
    });

    it('should return the content of the product with size 100', async () => {
      const res = await chai.request(app)
        .get(`/products/${productId}/data`)
        .set('x-token', token)
        .query({ size: '100' });
      expect(res).to.have.status(200);
    });
  });
});
