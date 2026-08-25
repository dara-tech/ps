import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/epr',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  wsPath: '/ws',
  apiPrefix: '/api/v1',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  khmer24ProxyUrl: process.env.KHMER24_PROXY_URL || '',
  khmer24ApiKey: process.env.KHMER24_API_KEY || '',
};

