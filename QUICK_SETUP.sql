-- Quick Setup: Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    expired_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_userid ON password_resets(userid);
CREATE INDEX IF NOT EXISTS idx_password_resets_expired_at ON password_resets(expired_at);

-- Verify the table was created
SELECT tablename FROM pg_tables WHERE tablename = 'password_resets';
