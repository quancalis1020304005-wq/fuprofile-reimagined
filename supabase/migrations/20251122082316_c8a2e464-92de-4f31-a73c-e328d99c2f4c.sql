-- Create artists table
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create albums table
CREATE TABLE public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  cover_url TEXT,
  release_date DATE,
  total_tracks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER NOT NULL, -- in seconds
  lyrics TEXT,
  lyrics_sync JSONB, -- for synced lyrics
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Create liked_songs table
CREATE TABLE public.liked_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Create listening_history table
CREATE TABLE public.listening_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_played INTEGER, -- in seconds
  completed BOOLEAN DEFAULT false
);

-- Create artist_follows table
CREATE TABLE public.artist_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, artist_id)
);

-- Enable RLS
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artists
CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT USING (true);

-- RLS Policies for albums
CREATE POLICY "Anyone can view albums" ON public.albums FOR SELECT USING (true);

-- RLS Policies for songs
CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);

-- RLS Policies for playlists
CREATE POLICY "Anyone can view public playlists" ON public.playlists 
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON public.playlists 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON public.playlists 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON public.playlists 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_songs
CREATE POLICY "Anyone can view songs in public playlists" ON public.playlist_songs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add songs to their playlists" ON public.playlist_songs 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove songs from their playlists" ON public.playlist_songs 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- RLS Policies for liked_songs
CREATE POLICY "Users can view their own liked songs" ON public.liked_songs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can like songs" ON public.liked_songs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike songs" ON public.liked_songs 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for listening_history
CREATE POLICY "Users can view their own history" ON public.listening_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their history" ON public.listening_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for artist_follows
CREATE POLICY "Users can view their own follows" ON public.artist_follows 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow artists" ON public.artist_follows 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow artists" ON public.artist_follows 
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_songs_artist_id ON public.songs(artist_id);
CREATE INDEX idx_songs_album_id ON public.songs(album_id);
CREATE INDEX idx_albums_artist_id ON public.albums(artist_id);
CREATE INDEX idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON public.playlist_songs(song_id);
CREATE INDEX idx_liked_songs_user_id ON public.liked_songs(user_id);
CREATE INDEX idx_listening_history_user_id ON public.listening_history(user_id);
CREATE INDEX idx_listening_history_played_at ON public.listening_history(played_at DESC);
CREATE INDEX idx_artist_follows_user_id ON public.artist_follows(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();