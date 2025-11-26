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
      return new Response(getClosePopupHTML('error', error), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code || !state) {
      return new Response(getClosePopupHTML('error', 'Missing parameters'), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate session (single-use)
    const { data: session, error: sessionError } = await supabase
      .from('connect_sessions')
      .select('*')
      .eq('id', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      console.error('Invalid or expired session');
      return new Response(getClosePopupHTML('error', 'Invalid session'), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Delete session (single-use)
    await supabase.from('connect_sessions').delete().eq('id', state);

    const provider = session.provider;
    const userId = session.loveble_user_id;

    if (provider === 'spotify') {
      const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
      const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        return new Response(getClosePopupHTML('error', 'Configuration error'), {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      const callbackUrl = `${supabaseUrl}/functions/v1/music-callback`;

      // Exchange code for token (with PKCE)
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
          code_verifier: session.code_verifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token exchange failed:', errorData);
        return new Response(getClosePopupHTML('error', 'Token exchange failed'), {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      const tokenData = await tokenResponse.json();

      // Fetch user profile from Spotify
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!profileResponse.ok) {
        console.error('Failed to fetch Spotify profile');
        return new Response(getClosePopupHTML('error', 'Failed to fetch profile'), {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      const profile = await profileResponse.json();

      // Save connection with profile data
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
      
      const { error: dbError } = await supabase
        .from('music_service_connections')
        .upsert({
          user_id: userId,
          service_type: 'spotify',
          provider_user_id: profile.id,
          display_name: profile.display_name || profile.id,
          avatar_url: profile.images?.[0]?.url || null,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          scopes: tokenData.scope,
          expires_at: expiresAt,
          status: 'active',
        }, {
          onConflict: 'user_id,service_type',
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(getClosePopupHTML('error', 'Database error'), {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      return new Response(getClosePopupHTML('success', 'spotify', profile.display_name), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response(getClosePopupHTML('error', 'Invalid provider'), {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error in music-callback:', error);
    return new Response(getClosePopupHTML('error', 'Unexpected error'), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

function getClosePopupHTML(status: string, provider?: string, displayName?: string): string {
  const message = status === 'success' 
    ? JSON.stringify({ success: true, provider, display_name: displayName })
    : JSON.stringify({ error: provider });
    
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication</title>
    </head>
    <body>
      <script>
        if (window.opener) {
          window.opener.postMessage(${message}, window.location.origin);
        }
        window.close();
      </script>
      <p>${status === 'success' ? 'Authentication successful! Closing...' : 'Authentication failed. Closing...'}</p>
    </body>
    </html>
  `;
}
