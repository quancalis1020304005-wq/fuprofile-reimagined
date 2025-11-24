import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Fetching Spotify connection for user:', user.id);

    // Get Spotify connection
    const { data: connection, error: connError } = await supabase
      .from('music_service_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_type', 'spotify')
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Spotify not connected', songs: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log('Found Spotify connection, fetching tracks...');

    // Fetch user's saved tracks from Spotify
    const spotifyResponse = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
      },
    });

    if (!spotifyResponse.ok) {
      const errorText = await spotifyResponse.text();
      console.error('Spotify API error:', spotifyResponse.status, errorText);
      
      // 403 Forbidden - App in Development mode
      if (spotifyResponse.status === 403) {
        console.error('Spotify API 403: User not registered in app');
        return new Response(
          JSON.stringify({ 
            error: 'Spotify Development Mode: Bạn cần thêm tài khoản Spotify vào allowlist tại developer.spotify.com/dashboard → Settings → User Management',
            songs: [],
            details: 'App đang ở chế độ Development. Chỉ người dùng được thêm vào allowlist mới sử dụng được.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // If token expired, try to refresh
      if (spotifyResponse.status === 401 && connection.refresh_token) {
        console.log('Token expired, refreshing...');
        // TODO: Implement token refresh logic
        return new Response(
          JSON.stringify({ error: 'Token expired, please reconnect Spotify', songs: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      throw new Error(`Spotify API error: ${spotifyResponse.status}`);
    }

    const spotifyData = await spotifyResponse.json();
    console.log('Fetched tracks from Spotify:', spotifyData.items?.length || 0);

    // Transform Spotify data to our format
    const songs = spotifyData.items.map((item: any) => ({
      id: item.track.id,
      title: item.track.name,
      artist_name: item.track.artists[0]?.name || 'Unknown Artist',
      artist_id: item.track.artists[0]?.id || '',
      album_id: item.track.album?.id || '',
      audio_url: item.track.preview_url || '', // Spotify preview URLs (30 seconds)
      cover_url: item.track.album?.images[0]?.url || '',
      duration: Math.floor(item.track.duration_ms / 1000),
      external_url: item.track.external_urls?.spotify || '',
    }));

    return new Response(
      JSON.stringify({ songs, source: 'spotify' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in spotify-tracks function:', error);
    return new Response(
      JSON.stringify({ error: error.message, songs: [] }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
