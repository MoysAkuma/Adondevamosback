const dotenv = require('dotenv');

dotenv.config();

const envSchema = {
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
  SUPABASE_SERVICE_KEY: process.env.SERVICE_KEY
};

const { value: env, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export { env };