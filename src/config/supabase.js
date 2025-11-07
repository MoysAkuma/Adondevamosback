import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in environment variables');
}

// Main client with default schema (public)
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public' // Default schema
  },
  auth: {
    persistSession: false // For server-side usage
  }
});

// User client
const userClient = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'users' }
});

// User client
const cataloguesClient = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'catalogues' }
});

// Trips client
const clientTrips = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'catalogues' }
});

export { 
  supabase as default,
  supabase as publicSchemaClient,
  userClient,
  cataloguesClient,
  clientTrips
};