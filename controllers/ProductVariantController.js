// controllers/ProductVariantController.js
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class ProductVariantController {
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
      variant_name,
      variant_value,
      brand,
      unit_price,
      cost_price,
      created_at,
      updated_at,
    } = req.body;

    if (!product || !variant_name || !variant_value || !cost_price || !created_at || !updated_at) {
      return res.status(400).json({ error: 'Missing parameter' });
    }

    const productVariantsCollection = dbClient.db.collection('product_variants');
    const existingVariant = await productVariantsCollection.findOne({ variant_name, variant_value });

    if (existingVariant) {
      return res.status(400).json({ error: 'Variant already exists' });
    }

    const newVariant = {
      id: uuidv4(),
      product,
      variant_name,
      variant_value,
      brand,
      unit_price,
      cost_price,
      created_at,
      updated_at,
    };

    const result = await productVariantsCollection.insertOne(newVariant);
    return res.status(201).json({
      id: result.insertedId,
      product: newVariant.product,
      variant_name: newVariant.variant_name,
      variant_value: newVariant.variant_value,
      brand: newVariant.brand,
      unit_price: newVariant.unit_price,
      cost_price: newVariant.cost_price,
      created_at: newVariant.created_at,
      updated_at: newVariant.updated_at,
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

    const variantId = req.params.id;
    const productVariantsCollection = dbClient.db.collection('product_variants');
    const variant = await productVariantsCollection.findOne({ id: variantId });

    if (!variant) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(variant);
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

    const productVariantsCollection = dbClient.db.collection('product_variants');
    const variants = await productVariantsCollection.find({ product: { $regex: product, $options: 'i' } })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(variants);
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

    const variantId = req.params.id;
    const productVariantsCollection = dbClient.db.collection('product_variants');
    const variant = await productVariantsCollection.findOne({ id: variantId });

    if (!variant) {
      return res.status(404).json({ error: 'Not found' });
    }

    await productVariantsCollection.updateOne({ id: variantId }, { $set: { is_deleted: true } });
    const updatedVariant = await productVariantsCollection.findOne({ id: variantId });

    return res.status(200).json(updatedVariant);
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

    const variantId = req.params.id;
    const productVariantsCollection = dbClient.db.collection('product_variants');
    const variant = await productVariantsCollection.findOne({ id: variantId });

    if (!variant) {
      return res.status(404).json({ error: 'Not found' });
    }

    await productVariantsCollection.updateOne({ id: variantId }, { $set: { is_deleted: false } });
    const updatedVariant = await productVariantsCollection.findOne({ id: variantId });

    return res.status(200).json(updatedVariant);
  }
}

export default ProductVariantController;
