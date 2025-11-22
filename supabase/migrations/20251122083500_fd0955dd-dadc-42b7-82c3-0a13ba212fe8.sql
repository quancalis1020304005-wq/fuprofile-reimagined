-- Create table to store music service connections
CREATE TABLE public.music_service_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('spotify', 'youtube_music')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_type)
);

-- Enable RLS
ALTER TABLE public.music_service_connections ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own connections
CREATE POLICY "Users can view their own music service connections"
  ON public.music_service_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own music service connections"
  ON public.music_service_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music service connections"
  ON public.music_service_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music service connections"
  ON public.music_service_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_music_service_connections_user_id ON public.music_service_connections(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_music_service_connections_updated_at
  BEFORE UPDATE ON public.music_service_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();