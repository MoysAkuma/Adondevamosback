import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SERVICE_KEY;

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

export { 
  supabase as default,
  supabase as publicSchemaClient,
  userSupabase,
  userClient,
  cataloguesClient
};