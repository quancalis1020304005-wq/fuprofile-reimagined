-- Add new columns to music_service_connections for provider identity
ALTER TABLE music_service_connections 
ADD COLUMN IF NOT EXISTS provider_user_id TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_music_connections_user_provider 
ON music_service_connections(user_id, service_type);

-- Create connect_sessions table for OAuth PKCE flow
CREATE TABLE IF NOT EXISTS connect_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loveble_user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on connect_sessions
ALTER TABLE connect_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own connect sessions
CREATE POLICY "Users can manage their own connect sessions"
ON connect_sessions
FOR ALL
USING (loveble_user_id = auth.uid());

-- Add index for state validation
CREATE INDEX IF NOT EXISTS idx_connect_sessions_id_expires 
ON connect_sessions(id, expires_at);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_connect_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM connect_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;