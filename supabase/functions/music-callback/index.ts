import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

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
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      const redirectUrl = state ? decodeURIComponent(state.split(':')[2]) : '/funmusics';
      return Response.redirect(`${redirectUrl}?error=${error}`, 302);
    }

    if (!code || !state) {
      return new Response(
        'Missing code or state parameter',
        { status: 400, headers: corsHeaders }
      );
    }

    const [service, userId, encodedRedirectUrl] = state.split(':');
    const redirectUrl = decodeURIComponent(encodedRedirectUrl);

    if (!userId) {
      console.error('No user ID in state');
      return Response.redirect(`${redirectUrl}?error=invalid_state`, 302);
    }

    if (service === 'spotify') {
      const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
      const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!clientId || !clientSecret) {
        console.error('Spotify credentials not configured');
        return Response.redirect(`${redirectUrl}?error=config_error`, 302);
      }

      const callbackUrl = `${supabaseUrl}/functions/v1/music-callback`;

      // Exchange code for token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: callbackUrl,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token exchange failed:', errorData);
        return Response.redirect(`${redirectUrl}?error=token_error`, 302);
      }

      const tokenData = await tokenResponse.json();
      console.log('Token received, expires_in:', tokenData.expires_in);

      // Use service role key to save connection
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

      // Save connection to database
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      const { error: dbError } = await supabase
        .from('music_service_connections')
        .upsert({
          user_id: userId,
          service_type: 'spotify',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
        }, {
          onConflict: 'user_id,service_type',
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return Response.redirect(`${redirectUrl}?error=db_error`, 302);
      }

      console.log('Connection saved successfully');
      return Response.redirect(`${redirectUrl}?success=spotify_connected`, 302);
    }

    return Response.redirect(`${redirectUrl}?error=invalid_service`, 302);

  } catch (error) {
    console.error('Error in music-callback:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
