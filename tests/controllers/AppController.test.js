// test/AppController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server'; // Assuming your Express app is exported from server.js
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('AppController', () => {
  before(async () => {
    // Set up the database and Redis
    await dbClient.db.collection('users').insertOne({ email: 'test@example.com', password: 'password' });
    await redisClient.set('test_key', 'test_value');
  });

  after(async () => {
    // Clean up the database and Redis
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('files').deleteMany({});
    await redisClient.del('test_key');
  });

  describe('GET /status', () => {
    it('should return the status of Redis and DB', async () => {
      const res = await chai.request(app)
        .get('/status');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('redis', true);
      expect(res.body).to.have.property('db', true);
    });
  });

  describe('GET /stats', () => {
    it('should return the number of users and files', async () => {
      const res = await chai.request(app)
        .get('/stats');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('users', 1);
      expect(res.body).to.have.property('files', 0);
    });
  });
});
