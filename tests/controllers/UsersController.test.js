// test/UsersController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('UsersController', () => {
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

  describe('GET /users/me', () => {
    it('should retrieve the user based on the token', async () => {
      const res = await chai.request(app)
        .get('/users/me')
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', userId);
      expect(res.body).to.have.property('email', 'test@example.com');
    });

    it('should return Unauthorized if no token is provided', async () => {
      const res = await chai.request(app)
        .get('/users/me');
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });

    it('should return Unauthorized if the token is invalid', async () => {
      const res = await chai.request(app)
        .get('/users/me')
        .set('x-token', 'invalid-token');
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });
  });
});
