// controllers/InventoryLogController.js
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class InventoryLogController {
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
      inventory,
      type,
      quantity,
      source_inventory,
      destination_inventory,
      movement_reason,
      created_at,
      updated_at,
    } = req.body;

    if (!inventory || !type || !quantity || !created_at || !updated_at) {
      return res.status(400).json({ error: 'Missing parameter' });
    }

    const inventoryLogsCollection = dbClient.db.collection('inventory_logs');
    const newInventoryLog = {
      id: uuidv4(),
      inventory,
      type,
      quantity,
      source_inventory,
      destination_inventory,
      created_by: userId,
      movement_reason,
      created_at,
      updated_at,
    };

    const result = await inventoryLogsCollection.insertOne(newInventoryLog);
    return res.status(201).json({
      id: result.insertedId,
      inventory: newInventoryLog.inventory,
      type: newInventoryLog.type,
      quantity: newInventoryLog.quantity,
      source_inventory: newInventoryLog.source_inventory,
      destination_inventory: newInventoryLog.destination_inventory,
      created_by: newInventoryLog.created_by,
      movement_reason: newInventoryLog.movement_reason,
      created_at: newInventoryLog.created_at,
      updated_at: newInventoryLog.updated_at,
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

    const logId = req.params.id;
    const inventoryLogsCollection = dbClient.db.collection('inventory_logs');
    const log = await inventoryLogsCollection.findOne({ id: logId });

    if (!log) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(log);
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

    const inventory = req.query.inventory || '';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    const inventoryLogsCollection = dbClient.db.collection('inventory_logs');
    const logs = await inventoryLogsCollection.find({ inventory: { $regex: inventory, $options: 'i' } })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(logs);
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

    const logId = req.params.id;
    const inventoryLogsCollection = dbClient.db.collection('inventory_logs');
    const log = await inventoryLogsCollection.findOne({ id: logId });

    if (!log) {
      return res.status(404).json({ error: 'Not found' });
    }

    await inventoryLogsCollection.updateOne({ id: logId }, { $set: { is_deleted: true } });
    const updatedLog = await inventoryLogsCollection.findOne({ id: logId });

    return res.status(200).json(updatedLog);
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

    const logId = req.params.id;
    const inventoryLogsCollection = dbClient.db.collection('inventory_logs');
    const log = await inventoryLogsCollection.findOne({ id: logId });

    if (!log) {
      return res.status(404).json({ error: 'Not found' });
    }

    await inventoryLogsCollection.updateOne({ id: logId }, { $set: { is_deleted: false } });
    const updatedLog = await inventoryLogsCollection.findOne({ id: logId });

    return res.status(200).json(updatedLog);
  }
}

export default InventoryLogController;
