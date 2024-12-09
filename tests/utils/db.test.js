// test/db.test.js
import chai from 'chai';
import { describe, it, before, after } from 'mocha';
import dbClient from '../utils/db';

const { expect } = chai;

describe('dbClient', () => {
  before(async () => {
    // Ensure the database is connected before running tests
    await dbClient.client.connect();
  });

  after(async () => {
    // Clean up the database after tests
    await dbClient.client.query('DELETE FROM users');
    await dbClient.client.query('DELETE FROM files');
    await dbClient.client.end();
  });

  describe('isAlive', () => {
    it('should return true when the database is connected', async () => {
      const isAlive = await dbClient.isAlive();
      expect(isAlive).to.be.true;
    });
  });

  describe('nbUsers', () => {
    it('should return 0 when there are no users', async () => {
      const count = await dbClient.nbUsers();
      expect(count).to.equal(0);
    });

    it('should return the correct number of users', async () => {
      await dbClient.client.query("INSERT INTO users (email, password) VALUES ('test@example.com', 'password')");
      const count = await dbClient.nbUsers();
      expect(count).to.equal(1);
    });
  });

  describe('nbFiles', () => {
    it('should return 0 when there are no files', async () => {
      const count = await dbClient.nbFiles();
      expect(count).to.equal(0);
    });

    it('should return the correct number of files', async () => {
      await dbClient.client.query("INSERT INTO files (name, type, userId) VALUES ('testfile.txt', 'file', 1)");
      const count = await dbClient.nbFiles();
      expect(count).to.equal(1);
    });
  });
});
