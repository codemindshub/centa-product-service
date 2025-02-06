// test/redis.test.js
import chai from 'chai';
import { describe, it, before, after } from 'mocha';
import redisClient from '../utils/redis';

const { expect } = chai;

describe('redisClient', () => {
  before(async () => {
    // Ensure Redis is connected before running tests
    await redisClient.client.connect();
  });

  after(async () => {
    // Clean up Redis after tests
    await redisClient.client.flushAll();
    await redisClient.client.quit();
  });

  describe('isAlive', () => {
    it('should return true when Redis is connected', () => {
      const isAlive = redisClient.isAlive();
      expect(isAlive).to.be.true;
    });
  });

  describe('get', () => {
    it('should return null for a non-existing key', async () => {
      const value = await redisClient.get('non_existing_key');
      expect(value).to.be.null;
    });

    it('should return the value for an existing key', async () => {
      await redisClient.set('test_key', 'test_value', 10);
      const value = await redisClient.get('test_key');
      expect(value).to.equal('test_value');
    });
  });

  describe('set', () => {
    it('should set a key with a value and expiration', async () => {
      await redisClient.set('test_key', 'test_value', 10);
      const value = await redisClient.get('test_key');
      expect(value).to.equal('test_value');
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      await redisClient.set('test_key', 'test_value', 10);
      await redisClient.del('test_key');
      const value = await redisClient.get('test_key');
      expect(value).to.be.null;
    });
  });
});
