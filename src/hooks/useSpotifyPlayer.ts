import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Extend Window interface for Spotify SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export interface SpotifyPlayerState {
  isReady: boolean;
  isPlaying: boolean;
  isPremium: boolean;
  currentTrack: any | null;
  position: number;
  duration: number;
  deviceId: string | null;
}

export const useSpotifyPlayer = () => {
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    isReady: false,
    isPlaying: false,
    isPremium: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    deviceId: null,
  });
  
  const playerRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    let player: any = null;

    const initializePlayer = async () => {
      try {
        // Get Spotify connection
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: connection } = await supabase
          .from("music_service_connections")
          .select("*")
          .eq("user_id", user.id)
          .eq("service_type", "spotify")
          .single();

        if (!connection) return;

        // Wait for Spotify SDK to load
        if (!window.Spotify) {
          window.onSpotifyWebPlaybackSDKReady = () => {
            initializePlayer();
          };
          return;
        }

        // Create player
        player = new window.Spotify.Player({
          name: 'FunMusics Web Player',
          getOAuthToken: (cb: (token: string) => void) => {
            cb(connection.access_token);
          },
          volume: 0.5
        });

        // Error handling
        player.addListener('initialization_error', ({ message }: any) => {
          console.error('Spotify initialization error:', message);
          toast({
            title: "Lỗi khởi tạo Spotify",
            description: message,
            variant: "destructive",
          });
        });

        player.addListener('authentication_error', ({ message }: any) => {
          console.error('Spotify authentication error:', message);
          toast({
            title: "Lỗi xác thực Spotify",
            description: "Vui lòng kết nối lại Spotify",
            variant: "destructive",
          });
        });

        player.addListener('account_error', ({ message }: any) => {
          console.error('Spotify account error:', message);
          if (message.includes('Premium')) {
            setPlayerState(prev => ({ ...prev, isPremium: false }));
            toast({
              title: "Yêu cầu Spotify Premium",
              description: "Chức năng phát nhạc toàn bộ chỉ dành cho tài khoản Spotify Premium. Bạn có thể nghe preview 30 giây miễn phí.",
              variant: "destructive",
            });
          }
        });

        player.addListener('playback_error', ({ message }: any) => {
          console.error('Spotify playback error:', message);
        });

        // Ready
        player.addListener('ready', ({ device_id }: any) => {
          console.log('Spotify player ready with Device ID', device_id);
          setPlayerState(prev => ({
            ...prev,
            isReady: true,
            isPremium: true,
            deviceId: device_id,
          }));
          toast({
            title: "Spotify đã sẵn sàng",
            description: "Bạn có thể phát nhạc toàn bộ từ Spotify",
          });
        });

        player.addListener('not_ready', ({ device_id }: any) => {
          console.log('Device ID has gone offline', device_id);
          setPlayerState(prev => ({ ...prev, isReady: false }));
        });

        // Player state changes
        player.addListener('player_state_changed', (state: any) => {
          if (!state) return;

          setPlayerState(prev => ({
            ...prev,
            isPlaying: !state.paused,
            currentTrack: state.track_window.current_track,
            position: state.position,
            duration: state.duration,
          }));
        });

        // Connect to the player
        const connected = await player.connect();
        
        if (connected) {
          playerRef.current = player;
          console.log('Successfully connected to Spotify player');
        }

      } catch (error: any) {
        console.error('Error initializing Spotify player:', error);
      }
    };

    initializePlayer();

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [toast]);

  const play = async (spotifyUri: string) => {
    if (!playerRef.current || !playerState.deviceId) {
      console.error('Player not ready');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connection } = await supabase
        .from("music_service_connections")
        .select("access_token")
        .eq("user_id", user.id)
        .eq("service_type", "spotify")
        .single();

      if (!connection) return;

      // Use Spotify Web API to play
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${playerState.deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.access_token}`,
        },
        body: JSON.stringify({
          uris: [spotifyUri],
        }),
      });
    } catch (error: any) {
      console.error('Error playing track:', error);
      toast({
        title: "Lỗi phát nhạc",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pause = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
  };

  const resume = () => {
    if (playerRef.current) {
      playerRef.current.resume();
    }
  };

  const seek = (positionMs: number) => {
    if (playerRef.current) {
      playerRef.current.seek(positionMs);
    }
  };

  const setVolume = (volume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  };

  return {
    playerState,
    play,
    pause,
    resume,
    seek,
    setVolume,
  };
};
