// controllers/FilesController.js
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class FilesController {
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

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const filesCollection = dbClient.db.collection('files');

    if (parentId !== 0) {
      const parentFile = await filesCollection.findOne({ _id: new dbClient.ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      userId: new dbClient.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : new dbClient.ObjectId(parentId),
    };

    if (type === 'folder') {
      const result = await filesCollection.insertOne(newFile);
      return res.status(201).json({
        id: result.insertedId,
        userId: newFile.userId,
        name: newFile.name,
        type: newFile.type,
        isPublic: newFile.isPublic,
        parentId: newFile.parentId,
      });
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const localPath = path.join(folderPath, uuidv4());
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    newFile.localPath = localPath;

    const result = await filesCollection.insertOne(newFile);

    if (type === 'image') {
      await fileQueue.add({ userId: userId.toString(), fileId: result.insertedId.toString() });
    }

    return res.status(201).json({
      id: result.insertedId,
      userId: newFile.userId,
      name: newFile.name,
      type: newFile.type,
      isPublic: newFile.isPublic,
      parentId: newFile.parentId,
      localPath: newFile.localPath,
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

    const fileId = req.params.id;
    const filesCollection = dbClient.db.collection('files');
    const file = await filesCollection.findOne({ _id: new dbClient.ObjectId(fileId), userId: new dbClient.ObjectId(userId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
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

    const filesCollection = dbClient.db.collection('files');
    const files = await filesCollection.find({ parentId: parentId === 0 ? 0 : new dbClient.ObjectId(parentId), userId: new dbClient.ObjectId(userId) })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(files);
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

    const fileId = req.params.id;
    const filesCollection = dbClient.db.collection('files');
    const file = await filesCollection.findOne({ _id: new dbClient.ObjectId(fileId), userId: new dbClient.ObjectId(userId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await filesCollection.updateOne({ _id: new dbClient.ObjectId(fileId) }, { $set: { isPublic: true } });
    const updatedFile = await filesCollection.findOne({ _id: new dbClient.ObjectId(fileId) });

    return res.status(200).json(updatedFile);
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

    const fileId = req.params.id;
    const filesCollection = dbClient.db.collection('files');
    const file = await filesCollection.findOne({ _id: new dbClient.ObjectId(fileId), userId: new dbClient.ObjectId(userId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await filesCollection.updateOne({ _id: new dbClient.ObjectId(fileId) }, { $set: { isPublic: false } });
    const updatedFile = await filesCollection.findOne({ _id: new dbClient.ObjectId(fileId) });

    return res.status(200).json(updatedFile);
  }

  static async getFile(req, res) {
    const fileId = req.params.id;
    const size = req.query.size;
    const filesCollection = dbClient.db.collection('files');
    const file = await filesCollection.findOne({ _id: new dbClient.ObjectId(fileId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!file.isPublic) {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(404).json({ error: 'Not found' });
      }

      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId || userId !== file.userId.toString()) {
        return res.status(404).json({ error: 'Not found' });
      }
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    let filePath = file.localPath;
    if (size && ['500', '250', '100'].includes(size)) {
      filePath = `${file.localPath}_${size}`;
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);
    const fileContent = fs.readFileSync(filePath);
    return res.status(200).send(fileContent);
  }
}

export default FilesController;
