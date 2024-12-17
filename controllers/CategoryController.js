// controllers/CategoryController.js
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class CategoryController {
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
      name,
      parent_category,
      description,
      created_at,
      updated_at,
    } = req.body;

    if (!name || !created_at || !updated_at) {
      return res.status(400).json({ error: 'Missing parameter' });
    }

    const categoriesCollection = dbClient.db.collection('categories');
    const existingCategory = await categoriesCollection.findOne({ name });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const newCategory = {
      id: uuidv4(),
      name,
      parent_category,
      description,
      created_at,
      updated_at,
    };

    const result = await categoriesCollection.insertOne(newCategory);
    return res.status(201).json({
      id: result.insertedId,
      name: newCategory.name,
      parent_category: newCategory.parent_category,
      description: newCategory.description,
      created_at: newCategory.created_at,
      updated_at: newCategory.updated_at,
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

    const categoryId = req.params.id;
    const categoriesCollection = dbClient.db.collection('categories');
    const category = await categoriesCollection.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(category);
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

    const name = req.query.name || '';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    const categoriesCollection = dbClient.db.collection('categories');
    const categories = await categoriesCollection.find({ name: { $regex: name, $options: 'i' } })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(categories);
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

    const categoryId = req.params.id;
    const categoriesCollection = dbClient.db.collection('categories');
    const category = await categoriesCollection.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ error: 'Not found' });
    }

    await categoriesCollection.updateOne({ id: categoryId }, { $set: { is_deleted: true } });
    const updatedCategory = await categoriesCollection.findOne({ id: categoryId });

    return res.status(200).json(updatedCategory);
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

    const categoryId = req.params.id;
    const categoriesCollection = dbClient.db.collection('categories');
    const category = await categoriesCollection.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ error: 'Not found' });
    }

    await categoriesCollection.updateOne({ id: categoryId }, { $set: { is_deleted: false } });
    const updatedCategory = await categoriesCollection.findOne({ id: categoryId });

    return res.status(200).json(updatedCategory);
  }
}

export default CategoryController;
