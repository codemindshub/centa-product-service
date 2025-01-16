// test/CategoryController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('CategoryController', () => {
  let token;
  let userId;
  let categoryId;

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
    await dbClient.db.collection('categories').deleteMany({});
    await redisClient.del(`auth_${token}`);
  });

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const res = await chai.request(app)
        .post('/categories')
        .set('x-token', token)
        .send({
          name: 'Test Category',
          description: 'A test category',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      categoryId = res.body.id;
    });
  });

  describe('GET /categories/:id', () => {
    it('should retrieve the category document', async () => {
      const res = await chai.request(app)
        .get(`/categories/${categoryId}`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', categoryId);
    });
  });

  describe('GET /categories', () => {
    it('should retrieve all categories with pagination', async () => {
      const res = await chai.request(app)
        .get('/categories')
        .set('x-token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /categories/:id/delete', () => {
    it('should set is_deleted to true', async () => {
      const res = await chai.request(app)
        .put(`/categories/${categoryId}/delete`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', true);
    });
  });

  describe('PUT /categories/:id/restore', () => {
    it('should set is_deleted to false', async () => {
      const res = await chai.request(app)
        .put(`/categories/${categoryId}/restore`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('is_deleted', false);
    });
  });
});
