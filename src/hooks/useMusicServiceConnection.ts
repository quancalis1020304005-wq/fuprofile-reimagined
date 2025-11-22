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

      // Open OAuth flow
      const redirectUrl = `${window.location.origin}/funmusics`;
      const authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/music-auth?service=${service}&redirect_url=${encodeURIComponent(redirectUrl)}`;
      
      window.location.href = authUrl;
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
