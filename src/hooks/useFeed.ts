import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type FeedMode = 'top' | 'recent';

export interface FeedPost {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  media_types: string[] | null;
  privacy: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  score_cache: number;
  created_at: string;
  author?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  viewer_state?: {
    liked: boolean;
    saved: boolean;
  };
}

interface UseFeedOptions {
  mode?: FeedMode;
  limit?: number;
}

export const useFeed = ({ mode = 'top', limit = 20 }: UseFeedOptions = {}) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      
      let query = supabase
        .from('posts' as any)
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .limit(limit);

      // Apply cursor for pagination
      if (!reset && cursor) {
        query = query.lt('created_at', cursor);
      }

      // Apply sorting based on mode
      if (mode === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else {
        // Top mode: sort by score_cache first, then recency
        query = query.order('score_cache', { ascending: false })
                     .order('created_at', { ascending: false });
      }

      const { data, error } = await query as any;

      if (error) throw error;

      // Fetch viewer state for each post
      const postsWithState = await Promise.all(
        (data || []).map(async (post: any) => {
          const profile = post.profiles;
          
          // Check if user liked this post
          let liked = false;
          if (currentUserId) {
            const { data: interaction } = await supabase
              .from('interactions' as any)
              .select('id')
              .eq('user_id', currentUserId)
              .eq('entity_type', 'post')
              .eq('entity_id', post.id)
              .eq('type', 'like')
              .single();
            liked = !!interaction;
          }

          return {
            ...post,
            author: profile ? {
              id: profile.id,
              name: profile.full_name || profile.username || 'User',
              avatar: profile.avatar_url,
            } : undefined,
            viewer_state: {
              liked,
              saved: false, // TODO: implement saved posts
            },
          };
        })
      );

      if (reset) {
        setPosts(postsWithState);
      } else {
        setPosts((prev) => [...prev, ...postsWithState]);
      }

      // Set cursor for next page
      if (postsWithState.length > 0) {
        setCursor(postsWithState[postsWithState.length - 1].created_at);
      }

      // Check if there are more posts
      setHasMore(postsWithState.length === limit);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  }, [mode, limit, cursor]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  }, [loading, hasMore, fetchPosts]);

  const refresh = useCallback(() => {
    setCursor(null);
    setHasMore(true);
    fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    refresh();
  }, [mode]);

  // Subscribe to new posts
  useEffect(() => {
    const channel = supabase
      .channel('feed-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return {
    posts,
    loading,
    hasMore,
    loadMore,
    refresh,
  };
};
