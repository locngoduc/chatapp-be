import { MongooseModuleOptions } from '@nestjs/mongoose';

import { config } from 'dotenv';

config();
const env = process.env;

const mongooseConfig: MongooseModuleOptions = {
  autoCreate: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
  connectionName: 'default',
  autoIndex: false,
  ssl: false,
  maxIdleTimeMS: 30000,
};

export const MONGO_URI = `mongodb://${env.MONGO_USER}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB}?authSource=admin`;

export default mongooseConfig;
