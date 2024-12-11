// controllers/productsController.js
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
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

    const { sku = 0, name, description, price, cost_price, category, barcode, max_stock_threshold, min_stock_threshold, is_deleted = false } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Missing description' });
    }

    if (!price) {
      return res.status(400).json({ error: 'Missing price' });
    }

    if (!cost_price) {
      return res.status(400).json({ error: 'Missing cost price' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Missing category' });
    }

    if (!barcode) {
      return res.status(400).json({ error: 'Missing barcode' });
    }

    if (!max_stock_threshold) {
      return res.status(400).json({ error: 'Missing max stock threshold' });
    }

    if (!min_stock_threshold) {
      return res.status(400).json({ error: 'Missing min stock threshold' });
    }

    const productsCollection = dbClient.db.collection('products');

    if (sku !== 0) {
      const parentProduct = await productsCollection.findOne({ _id: new dbClient.ObjectId(sku)});
      if (!parentProduct) {
        return res.status(400).json({ error: 'Parent not found' });
      }
    }

    const newProduct = {
      userId: new dbClient.ObjectId(userId),
      name, description, price, cost_price, category, barcode, max_stock_threshold, min_stock_threshold, is_deleted,
      sku: sku === 0 ? 0 : new dbClient.ObjectId(sku),
    };

    if (newProduct) {
      const result = await productsCollection.insertOne(newProduct);
      return res.status(201).json({
        id: result.insertedId,
        userId: newProduct.userId,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        cost_price: newProduct.cost_price,
        category: newProduct.category,
        barcode: newProduct.barcode,
        max_stock_threshold: newProduct.max_stock_threshold,
        min_stock_threshold: newProduct.min_stock_threshold,
        is_deleted: newProduct.is_deleted,
        sku: newProduct.sku,
      });
    }

    const productPath = process.env.FOLDER_PATH || '/tmp/centa-product-service';
    if (!fs.existsSync(productPath)) {
      fs.mkdirSync(productPath, { recursive: true });
    }

    const localPath = path.join(productPath, uuidv4());
    fs.writeproductSync(localPath, Buffer.from(data, 'base64'));

    newProduct.localPath = localPath;

    const result = await productsCollection.insertOne(newProduct);

    if (type === 'image') {
      await productQueue.add({ userId: userId.toString(), productId: result.insertedId.toString() });
    }

    return res.status(201).json({
      id: result.insertedId,
      userId: newproduct.userId,
      name: newproduct.name,
      type: newproduct.type,
      isPublic: newproduct.isPublic,
      parentId: newproduct.parentId,
      localPath: newproduct.localPath,
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

    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    const productsCollection = dbClient.db.collection('products');
    const products = await productsCollection.find({ parentId: parentId === 0 ? 0 : new dbClient.ObjectId(parentId), userId: new dbClient.ObjectId(userId) })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(products);
  }

  static async putPublish(req, res) {
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

    await productsCollection.updateOne({ _id: new dbClient.ObjectId(productId) }, { $set: { isPublic: true } });
    const updatedproduct = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId) });

    return res.status(200).json(updatedproduct);
  }

  static async putUnpublish(req, res) {
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

    await productsCollection.updateOne({ _id: new dbClient.ObjectId(productId) }, { $set: { isPublic: false } });
    const updatedproduct = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId) });

    return res.status(200).json(updatedproduct);
  }

  static async getproduct(req, res) {
    const productId = req.params.id;
    const size = req.query.size;
    const productsCollection = dbClient.db.collection('products');
    const product = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!product.isPublic) {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(404).json({ error: 'Not found' });
      }

      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId || userId !== product.userId.toString()) {
        return res.status(404).json({ error: 'Not found' });
      }
    }

    if (product.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    let productPath = product.localPath;
    if (size && ['500', '250', '100'].includes(size)) {
      productPath = `${product.localPath}_${size}`;
    }

    if (!fs.existsSync(productPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(product.name);
    res.setHeader('Content-Type', mimeType);
    const productContent = fs.readproductSync(productPath);
    return res.status(200).send(productContent);
  }
}

export default ProductsController;
