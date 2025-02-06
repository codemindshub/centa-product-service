// utils/db.js
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 5432;
    const database = process.env.DB_DATABASE || 'centa-product-service';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || '';

    this.client = new Client({
      host,
      port,
      database,
      user,
      password,
    });

    this.client.connect().catch((err) => {
      console.error('PostgreSQL connection error:', err);
    });
  }

  async isAlive() {
    try {
      await this.client.query('SELECT 1');
      return true;
    } catch (err) {
      console.error('PostgreSQL isAlive error:', err);
      return false;
    }
  }

  async nbUsers() {
    try {
      const res = await this.client.query('SELECT COUNT(*) FROM users');
      return parseInt(res.rows[0].count, 10);
    } catch (err) {
      console.error('PostgreSQL nbUsers error:', err);
      return 0;
    }
  }

  async nbProducts() {
    try {
      const res = await this.client.query('SELECT COUNT(*) FROM products');
      return parseInt(res.rows[0].count, 10);
    } catch (err) {
      console.error('PostgreSQL nbProducts error:', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
