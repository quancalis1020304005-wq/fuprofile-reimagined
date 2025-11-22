import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const service = url.searchParams.get('service');
    const redirectUrl = url.searchParams.get('redirect_url') || url.origin;

    if (!service) {
      return new Response(
        JSON.stringify({ error: 'Service parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (service === 'spotify') {
      const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
      
      if (!clientId) {
        console.error('SPOTIFY_CLIENT_ID not configured');
        return new Response(
          JSON.stringify({ error: 'Spotify client ID not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const scopes = [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'user-library-modify',
        'user-read-playback-state',
        'user-modify-playback-state',
        'streaming',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
      ].join(' ');

      const callbackUrl = `${url.origin}/functions/v1/music-callback`;
      const state = `${service}:${encodeURIComponent(redirectUrl)}`;

      const authUrl = new URL('https://accounts.spotify.com/authorize');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', callbackUrl);
      authUrl.searchParams.set('scope', scopes);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('show_dialog', 'true');

      console.log('Redirecting to Spotify auth:', authUrl.toString());

      return Response.redirect(authUrl.toString(), 302);
    }

    if (service === 'youtube_music') {
      return new Response(
        JSON.stringify({ error: 'YouTube Music OAuth coming soon' }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid service' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in music-auth:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
