// controllers/InventoryController.js
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class InventoryController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      product,
      quantity,
      quantity_reserved,
      batch_number,
      location,
      manufacturing_date,
      expiry_date,
      created_at,
      updated_at,
    } = req.body;

    if (!product || !quantity || !location || !manufacturing_date || !expiry_date || !created_at || !updated_at) {
      return res.status(400).json({ error: 'Missing parameter' });
    }

    const inventoriesCollection = dbClient.db.collection('inventories');
    const newInventory = {
      id: uuidv4(),
      product,
      quantity,
      quantity_reserved: quantity_reserved || 0,
      batch_number,
      location,
      manufacturing_date,
      expiry_date,
      is_deleted: false,
      created_at,
      updated_at,
    };

    const result = await inventoriesCollection.insertOne(newInventory);
    return res.status(201).json({
      id: result.insertedId,
      product: newInventory.product,
      quantity: newInventory.quantity,
      quantity_reserved: newInventory.quantity_reserved,
      batch_number: newInventory.batch_number,
      location: newInventory.location,
      manufacturing_date: newInventory.manufacturing_date,
      expiry_date: newInventory.expiry_date,
      is_deleted: newInventory.is_deleted,
      created_at: newInventory.created_at,
      updated_at: newInventory.updated_at,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const inventoryId = req.params.id;
    const inventoriesCollection = dbClient.db.collection('inventories');
    const inventory = await inventoriesCollection.findOne({ id: inventoryId });

    if (!inventory) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(inventory);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const product = req.query.product || '';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    const inventoriesCollection = dbClient.db.collection('inventories');
    const inventories = await inventoriesCollection.find({ product: { $regex: product, $options: 'i' } })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(inventories);
  }

  static async putDelete(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const inventoryId = req.params.id;
    const inventoriesCollection = dbClient.db.collection('inventories');
    const inventory = await inventoriesCollection.findOne({ id: inventoryId });

    if (!inventory) {
      return res.status(404).json({ error: 'Not found' });
    }

    await inventoriesCollection.updateOne({ id: inventoryId }, { $set: { is_deleted: true } });
    const updatedInventory = await inventoriesCollection.findOne({ id: inventoryId });

    return res.status(200).json(updatedInventory);
  }

  static async putRestore(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const inventoryId = req.params.id;
    const inventoriesCollection = dbClient.db.collection('inventories');
    const inventory = await inventoriesCollection.findOne({ id: inventoryId });

    if (!inventory) {
      return res.status(404).json({ error: 'Not found' });
    }

    await inventoriesCollection.updateOne({ id: inventoryId }, { $set: { is_deleted: false } });
    const updatedInventory = await inventoriesCollection.findOne({ id: inventoryId });

    return res.status(200).json(updatedInventory);
  }
}

export default InventoryController;
