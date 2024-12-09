// test/FilesController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import app from '../server'; // Assuming your Express app is exported from server.js
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

chai.use(chaiHttp);
const { expect } = chai;

describe('FilesController', () => {
  let token;
  let userId;
  let fileId;

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
    await dbClient.db.collection('files').deleteMany({});
    await redisClient.del(`auth_${token}`);
  });

  describe('POST /files', () => {
    it('should create a new file', async () => {
      const res = await chai.request(app)
        .post('/files')
        .set('x-token', token)
        .send({
          name: 'testfile.txt',
          type: 'file',
          data: Buffer.from('Hello, world!').toString('base64'),
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
      fileId = res.body.id;
    });
  });

  describe('GET /files/:id', () => {
    it('should retrieve the file document', async () => {
      const res = await chai.request(app)
        .get(`/files/${fileId}`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', fileId);
    });
  });

  describe('GET /files', () => {
    it('should retrieve all files with pagination', async () => {
      const res = await chai.request(app)
        .get('/files')
        .set('x-token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /files/:id/publish', () => {
    it('should set isPublic to true', async () => {
      const res = await chai.request(app)
        .put(`/files/${fileId}/publish`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('isPublic', true);
    });
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should set isPublic to false', async () => {
      const res = await chai.request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('isPublic', false);
    });
  });

  describe('GET /files/:id/data', () => {
    it('should return the content of the file', async () => {
      const res = await chai.request(app)
        .get(`/files/${fileId}/data`)
        .set('x-token', token);
      expect(res).to.have.status(200);
      expect(res.text).to.equal('Hello, world!');
    });

    it('should return the content of the file with size 100', async () => {
      const res = await chai.request(app)
        .get(`/files/${fileId}/data`)
        .set('x-token', token)
        .query({ size: '100' });
      expect(res).to.have.status(200);
      // Add more assertions based on your thumbnail generation logic
    });
  });
});
