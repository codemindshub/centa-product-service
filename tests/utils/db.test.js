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
    await dbClient.client.query('DELETE FROM products');
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

  describe('nbProducts', () => {
    it('should return 0 when there are no products', async () => {
      const count = await dbClient.nbProducts();
      expect(count).to.equal(0);
    });

    it('should return the correct number of products', async () => {
      await dbClient.client.query("INSERT INTO products (name, type, userId) VALUES ('testproducts.txt', 'products', 1)");
      const count = await dbClient.nbProducts();
      expect(count).to.equal(1);
    });
  });
});
