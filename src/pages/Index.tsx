import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <Logo />
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
<div style="text-align:center;padding:80px 20px;background:#121212;color:white;min-height:100vh;font-family:system-ui,sans-serif;">
  <h2 style="font-size:32px;margin-bottom:40px;color:#1DB954;">Fun Music - Spotify</h2>
  <button id="connectBtn" onclick="connectSpotify()" 
    style="padding:18px 40px;background:#1DB954;color:white;border:none;border-radius:50px;font-size:20px;cursor:pointer;font-weight:bold;">
    Kết nối Spotify của bạn
  </button>
  <div id="spotify-status" style="margin-top:50px;font-size:22px;color:#1DB954;font-weight:bold;"></div>
</div>

<script src="https://sdk.scdn.co/spotify-player.js"></script>
<script>
const clientId = '2a8edf89801457f81318074e2d3e76e';
const redirectUri = 'https://fuprofile-reimagined.lovable.app/fun-music';
const scopes = 'streaming user-read-email user-read-private user-library-read user-read-playback-state user-modify-playback-state playlist-read-private';

function connectSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  window.location = authUrl;
}

function getHashParams() {
  const hash = window.location.hash.substring(1);
  const params = {};
  hash.split('&').forEach(p => { const [k, v] = p.split('='); params[k] = decodeURIComponent(v); });
  return params;
}

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = getHashParams().access_token || localStorage.getItem('spotifyToken');
  if (!token) return;
  localStorage.set27Item('spotifyToken', token);
  document.getElementById('connectBtn').style.display = 'none';
  document.getElementById('spotify-status').innerHTML = 'Đang kết nối Spotify...';

  const player = new Spotify.Player({
    name: 'Lovable Fun Music',
    getOAuthToken: cb => cb(token),
    volume: 0.8
  });

  player.addListener('ready', () => {
    document.getElementById('spotify-status').innerHTML = 'Kết nối thành công! Nhạc đã sẵn sàng phát 🎧<br><small>Mở Spotify để chọn bài và play nhé!</small>';
  });

  player.connect();
};

if (window.location.hash.includes('access_token') || localStorage.getItem('spotifyToken')) {
  window.onSpotifyWebPlaybackSDKReady();
}
</script>