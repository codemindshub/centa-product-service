// controllers/ProductsController.js
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class ProductsController {
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
      sku,
      name,
      description,
      price,
      cost_price,
      category,
      barcode,
      max_stock_threshold,
      min_stock_threshold,
      is_deleted,
      created_at,
      updated_at,
    } = req.body;

    if (!sku || !name || !price || !cost_price || !category || !created_at || !updated_at) {
      return res.status(400).json({ error: 'Missing parameter' });
    }

    const productsCollection = dbClient.db.collection('products');
    const existingProduct = await productsCollection.findOne({ sku });

    if (existingProduct) {
      return res.status(400).json({ error: 'Product already exists' });
    }

    const newProduct = {
      userId: new dbClient.ObjectId(userId),
      sku,
      name,
      description,
      price,
      cost_price,
      category: new dbClient.ObjectId(category),
      barcode,
      max_stock_threshold,
      min_stock_threshold,
      is_deleted: is_deleted || false,
      created_at,
      updated_at,
    };

    const folderPath = process.env.FOLDER_PATH || '/tmp/centa_products_service';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const localPath = path.join(folderPath, uuidv4());
    fs.writeFileSync(localPath, JSON.stringify(newProduct));

    newProduct.localPath = localPath;

    const result = await productsCollection.insertOne(newProduct);
    return res.status(201).json({
      id: result.insertedId,
      userId: newProduct.userId,
      sku: newProduct.sku,
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      cost_price: newProduct.cost_price,
      category: newProduct.category,
      barcode: newProduct.barcode,
      max_stock_threshold: newProduct.max_stock_threshold,
      min_stock_threshold: newProduct.min_stock_threshold,
      is_deleted: newProduct.is_deleted,
      created_at: newProduct.created_at,
      updated_at: newProduct.updated_at,
      localPath: newProduct.localPath,
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

    const productId = req.params.id;
    const productsCollection = dbClient.db.collection('products');
    const product = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId), userId: new dbClient.ObjectId(userId) });

    if (!product) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(product);
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

    const sku = req.query.sku || '';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    const productsCollection = dbClient.db.collection('products');
    const products = await productsCollection.find({ sku: { $regex: sku, $options: 'i' }, userId: new dbClient.ObjectId(userId) })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(products);
  }

  static async updatePut(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const productId = req.params.id;
    const productsCollection = dbClient.db.collection('products');
    const product = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId), userId: new dbClient.ObjectId(userId) });

    if (!product) {
      return res.status(404).json({ error: 'Not found' });
    }

    const {
      sku,
      name,
      description,
      price,
      cost_price,
      category,
      barcode,
      max_stock_threshold,
      min_stock_threshold,
      is_deleted,
      created_at,
      updated_at,
    } = req.body;

    if (!sku || !name || !price || !cost_price || !category || !created_at || !updated_at) {
      return res.status(400).json({ error: 'Missing parameter' });
    }

    const updatedProduct = {
      userId: new dbClient.ObjectId(userId),
      sku,
      name,
      description,
      price,
      cost_price,
      category: new dbClient.ObjectId(category),
      barcode,
      max_stock_threshold,
      min_stock_threshold,
      is_deleted: is_deleted || false,
      created_at,
      updated_at,
    };

    const folderPath = process.env.FOLDER_PATH || '/tmp/centa_products_service';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const localPath = path.join(folderPath, uuidv4());
    fs.writeFileSync(localPath, JSON.stringify(updatedProduct));

    updatedProduct.localPath = localPath;

    await productsCollection.updateOne({ _id: new dbClient.ObjectId(productId), userId: new dbClient.ObjectId(userId) }, { $set: updatedProduct });

    return res.status(200).json({
      id: product._id,
      userId: updatedProduct.userId,
      sku: updatedProduct.sku,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      cost_price: updatedProduct.cost_price,
      category: updated
    });
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

  const productId = req.params.id;
  const productsCollection = dbClient.db.collection('products');
  const product = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId), userId: new dbClient.ObjectId(userId) });

  if (!product) {
    return res.status(404).json({ error: 'Not found' });
  }

  await productsCollection.updateOne({ _id: new dbClient.ObjectId(productId) }, { $set: { is_deleted: true } });
  const updatedProduct = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId) });

  return res.status(200).json(updatedProduct);
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

  const productId = req.params.id;
  const productsCollection = dbClient.db.collection('products');
  const product = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId), userId: new dbClient.ObjectId(userId) });

  if (!product) {
    return res.status(404).json({ error: 'Not found' });
  }

  await productsCollection.updateOne({ _id: new dbClient.ObjectId(productId) }, { $set: { is_deleted: false } });
  const updatedProduct = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId) });

  return res.status(200).json(updatedProduct);
}
}

export default ProductsController;
