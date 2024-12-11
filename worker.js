// worker.js
import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';
import dbClient from './utils/db.js';

const productQueue = new Bull('productQueue');

productQueue.process(async (job) => {
  const { userId, productId } = job.data;

  if (!productId) {
    throw new Error('Missing productId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const productsCollection = dbClient.db.collection('products');
  const product = await productsCollection.findOne({ _id: new dbClient.ObjectId(productId), userId: new dbClient.ObjectId(userId) });

  if (!product) {
    throw new Error('product not found');
  }

  const sizes = [500, 250, 100];
  const options = { responseType: 'buffer' };

  for (const size of sizes) {
    const thumbnail = await imageThumbnail(product.localPath, { ...options, width: size });
    const thumbnailPath = `${product.localPath}_${size}`;
    fs.writeproductSync(thumbnailPath, thumbnail);
  }
});

console.log('Worker is running...');
