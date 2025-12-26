import dotenv from 'dotenv';

dotenv.config();

export const env = {
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
  SUPABASE_SERVICE_KEY: process.env.SERVICE_KEY,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  PORT : process.env.PORT,
  FRONT_URL: process.env.FRONT_URL,
  SECRET: process.env.SECRET,
  NODE_ENV: process.env.NODE_ENV,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE || 'false',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'AdondeVamos'
};