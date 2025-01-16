// controllers/InventoryTransferController.js
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class InventoryTransferController {
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
      origin,
      destination,
      quantity,
      transfer_type,
      tracking_number,
      status,
      transfer_date,
      receipt_date,
      created_at,
    } = req.body;

    if (!product || !origin || !destination || !quantity || !status || !created_at) {
      return res.status(400).json({ error: 'Missing parameter' });
    }

    const inventoryTransfersCollection = dbClient.db.collection('inventory_transfers');
    const newInventoryTransfer = {
      id: uuidv4(),
      product,
      origin,
      destination,
      quantity,
      transfer_type,
      tracking_number,
      status,
      transfer_date,
      receipt_date,
      created_at,
      created_by: userId,
    };

    const result = await inventoryTransfersCollection.insertOne(newInventoryTransfer);
    return res.status(201).json({
      id: result.insertedId,
      product: newInventoryTransfer.product,
      origin: newInventoryTransfer.origin,
      destination: newInventoryTransfer.destination,
      quantity: newInventoryTransfer.quantity,
      transfer_type: newInventoryTransfer.transfer_type,
      tracking_number: newInventoryTransfer.tracking_number,
      status: newInventoryTransfer.status,
      transfer_date: newInventoryTransfer.transfer_date,
      receipt_date: newInventoryTransfer.receipt_date,
      created_at: newInventoryTransfer.created_at,
      created_by: newInventoryTransfer.created_by,
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

    const transferId = req.params.id;
    const inventoryTransfersCollection = dbClient.db.collection('inventory_transfers');
    const transfer = await inventoryTransfersCollection.findOne({ id: transferId });

    if (!transfer) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(transfer);
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

    const inventoryTransfersCollection = dbClient.db.collection('inventory_transfers');
    const transfers = await inventoryTransfersCollection.find({ product: { $regex: product, $options: 'i' } })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(transfers);
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

    const transferId = req.params.id;
    const inventoryTransfersCollection = dbClient.db.collection('inventory_transfers');
    const transfer = await inventoryTransfersCollection.findOne({ id: transferId });

    if (!transfer) {
      return res.status(404).json({ error: 'Not found' });
    }

    await inventoryTransfersCollection.updateOne({ id: transferId }, { $set: { is_deleted: true } });
    const updatedTransfer = await inventoryTransfersCollection.findOne({ id: transferId });

    return res.status(200).json(updatedTransfer);
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

    const transferId = req.params.id;
    const inventoryTransfersCollection = dbClient.db.collection('inventory_transfers');
    const transfer = await inventoryTransfersCollection.findOne({ id: transferId });

    if (!transfer) {
      return res.status(404).json({ error: 'Not found' });
    }

    await inventoryTransfersCollection.updateOne({ id: transferId }, { $set: { is_deleted: false } });
    const updatedTransfer = await inventoryTransfersCollection.findOne({ id: transferId });

    return res.status(200).json(updatedTransfer);
  }
}

export default InventoryTransferController;
