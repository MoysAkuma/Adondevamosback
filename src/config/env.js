import dotenv from 'dotenv';

dotenv.config();

const env = {
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
  SUPABASE_SERVICE_KEY: process.env.SERVICE_KEY
};

export { env };