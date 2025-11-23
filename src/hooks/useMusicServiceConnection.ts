import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MusicService = "spotify" | "youtube_music";

interface MusicServiceConnection {
  id: string;
  user_id: string;
  service_type: MusicService;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  connected_at: string;
}

export const useMusicServiceConnection = () => {
  const [connections, setConnections] = useState<MusicServiceConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("music_service_connections")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setConnections((data || []) as MusicServiceConnection[]);
    } catch (error: any) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectService = async (service: MusicService) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để liên kết tài khoản",
          variant: "destructive",
        });
        return;
      }

      // Open OAuth in popup window (like MetaMask)
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const redirectUrl = `${window.location.origin}/funmusics`;
      const authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/music-auth?service=${service}&user_id=${user.id}&redirect_url=${encodeURIComponent(redirectUrl)}`;
      
      const popup = window.open(
        authUrl,
        `${service}_auth`,
        `width=${width},height=${height},left=${left},top=${top},popup=yes`
      );

      if (!popup) {
        toast({
          title: "Lỗi",
          description: "Vui lòng cho phép popup để kết nối",
          variant: "destructive",
        });
        return;
      }

      // Listen for callback
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          fetchConnections();
          
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('success')) {
            toast({
              title: "Thành công",
              description: `Đã kết nối với ${service === 'spotify' ? 'Spotify' : 'YouTube Music'}`,
            });
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
          } else if (urlParams.get('error')) {
            toast({
              title: "Lỗi",
              description: "Không thể kết nối. Vui lòng thử lại.",
              variant: "destructive",
            });
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      }, 500);

    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disconnectService = async (service: MusicService) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("music_service_connections")
        .delete()
        .eq("user_id", user.id)
        .eq("service_type", service);

      if (error) throw error;

      setConnections(connections.filter(c => c.service_type !== service));
      
      toast({
        title: "Thành công",
        description: `Đã ngắt kết nối với ${service === 'spotify' ? 'Spotify' : 'YouTube Music'}`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getConnection = (service: MusicService) => {
    return connections.find(c => c.service_type === service);
  };

  const isConnected = (service: MusicService) => {
    return connections.some(c => c.service_type === service);
  };

  return {
    connections,
    loading,
    connectService,
    disconnectService,
    getConnection,
    isConnected,
    refreshConnections: fetchConnections,
  };
};
