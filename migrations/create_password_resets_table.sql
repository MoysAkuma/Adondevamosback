-- Create password_resets table for secure password recovery
-- This table stores temporary reset tokens that expire after 1 hour

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    expired_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- Create index on userid for faster deletion of user tokens
CREATE INDEX IF NOT EXISTS idx_password_resets_userid ON password_resets(userid);

-- Create index on expired_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_password_resets_expired_at ON password_resets(expired_at);

-- Optional: Add a comment to document the table
COMMENT ON TABLE password_resets IS 'Stores temporary password reset tokens (UUID) that expire after 1 hour';
COMMENT ON COLUMN password_resets.token IS 'Unique UUID reset token sent to user email';
COMMENT ON COLUMN password_resets.expired_at IS 'Token expiration timestamp (1 hour from creation)';
