import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

interface AppConfig {
  port: number;
  mongoUri: string;
}

const _config: AppConfig = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || '',
};

if (!_config.mongoUri) {
  throw new Error('⚠️ MONGODB_URI is not defined in .env');
}

export const config = Object.freeze(_config);
