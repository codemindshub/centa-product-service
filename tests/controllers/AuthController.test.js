// test/AuthController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('AuthController', () => {
  let token;
  let userId;

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
    await redisClient.del(`auth_${token}`);
  });

  describe('GET /connect', () => {
    it('should sign in the user and return a token', async () => {
      const res = await chai.request(app)
        .get('/connect')
        .auth('test@example.com', 'password');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
    });

    it('should return error if credentials are invalid', async () => {
      const res = await chai.request(app)
        .get('/connect')
        .auth('invalid@example.com', 'password');
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });

    it('should return error if authorization header is missing', async () => {
      const res = await chai.request(app)
        .get('/connect');
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });
  });

  describe('GET /disconnect', () => {
    it('should sign out the user', async () => {
      const res = await chai.request(app)
        .get('/disconnect')
        .set('x-token', token);
      expect(res).to.have.status(204);
    });

    it('should return error if token is invalid', async () => {
      const res = await chai.request(app)
        .get('/disconnect')
        .set('x-token', 'invalid-token');
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });

    it('should return error if token is missing', async () => {
      const res = await chai.request(app)
        .get('/disconnect');
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });
  });
});
