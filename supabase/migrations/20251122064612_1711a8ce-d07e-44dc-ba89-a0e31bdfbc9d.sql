-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for friendship status
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'blocked');

-- Create enum for follow target type
CREATE TYPE public.follow_target_type AS ENUM ('user', 'page');

-- Create enum for interaction type
CREATE TYPE public.interaction_type AS ENUM ('like', 'comment', 'share', 'view', 'reaction');

-- Create enum for privacy settings
CREATE TYPE public.privacy_type AS ENUM ('PUBLIC', 'FRIENDS', 'ONLY_ME', 'CUSTOM');

-- Create enum for media type
CREATE TYPE public.media_type AS ENUM ('image', 'video', 'audio', 'document');

-- Create enum for entity type
CREATE TYPE public.entity_type AS ENUM ('post', 'comment', 'story', 'reel');

-- Add privacy and metrics to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS privacy privacy_type DEFAULT 'PUBLIC',
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS score_cache FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS parent_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_b UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status friendship_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_a, user_b),
  CHECK (user_a < user_b)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_friendships_user_a ON public.friendships(user_a);
CREATE INDEX idx_friendships_user_b ON public.friendships(user_b);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- Create follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type follow_target_type DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, target_id, target_type)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_target ON public.follows(target_id, target_type);

-- Create media table
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  thumb_url TEXT,
  type media_type DEFAULT 'image',
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_media_owner ON public.media(owner_id);

-- Create stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_stories_user ON public.stories(user_id);
CREATE INDEX idx_stories_expires ON public.stories(expires_at);

-- Create reels table
CREATE TABLE public.reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  metrics JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'::jsonb,
  score_cache FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reels_user ON public.reels(user_id);
CREATE INDEX idx_reels_created ON public.reels(created_at DESC);

-- Create interactions table
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  type interaction_type NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id, type)
);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_interactions_user ON public.interactions(user_id);
CREATE INDEX idx_interactions_entity ON public.interactions(entity_type, entity_id);
CREATE INDEX idx_interactions_type ON public.interactions(type);

-- Create feed_snapshots table
CREATE TABLE public.feed_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cursor TEXT,
  post_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.feed_snapshots ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feed_snapshots_user ON public.feed_snapshots(user_id);
CREATE INDEX idx_feed_snapshots_created ON public.feed_snapshots(created_at DESC);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can create friendship requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can update their own friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can delete their own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- RLS Policies for follows
CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- RLS Policies for media
CREATE POLICY "Anyone can view public media"
  ON public.media FOR SELECT
  USING (true);

CREATE POLICY "Users can upload their own media"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own media"
  ON public.media FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for stories
CREATE POLICY "Anyone can view active stories"
  ON public.stories FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Users can create their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reels
CREATE POLICY "Anyone can view reels"
  ON public.reels FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reels"
  ON public.reels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels"
  ON public.reels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels"
  ON public.reels FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for interactions
CREATE POLICY "Users can view their own interactions"
  ON public.interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
  ON public.interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON public.interactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for feed_snapshots
CREATE POLICY "Users can view their own feed snapshots"
  ON public.feed_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage feed snapshots"
  ON public.feed_snapshots FOR ALL
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reels_updated_at
  BEFORE UPDATE ON public.reels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically assign default user role
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger to assign default role on user creation
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();