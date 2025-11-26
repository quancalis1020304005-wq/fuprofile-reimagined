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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để liên kết tài khoản",
          variant: "destructive",
        });
        return;
      }

      // Call start endpoint to get auth URL
      const { data, error } = await supabase.functions.invoke('music-auth', {
        body: { provider: service },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error || !data?.auth_url) {
        toast({
          title: "Lỗi",
          description: "Không thể khởi tạo kết nối",
          variant: "destructive",
        });
        return;
      }

      // Open OAuth in popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.auth_url,
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

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        const { success, error, provider, display_name } = event.data;
        
        if (success && provider === service) {
          toast({
            title: "Thành công",
            description: `Đã kết nối với ${display_name || (service === 'spotify' ? 'Spotify' : 'YouTube Music')}`,
          });
          fetchConnections();
        } else if (error) {
          toast({
            title: "Lỗi",
            description: "Không thể kết nối. Vui lòng thử lại.",
            variant: "destructive",
          });
        }
        
        window.removeEventListener('message', handleMessage);
      };

      window.addEventListener('message', handleMessage);

      // Fallback: check if popup closed without message
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          setTimeout(() => {
            window.removeEventListener('message', handleMessage);
            fetchConnections();
          }, 500);
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
