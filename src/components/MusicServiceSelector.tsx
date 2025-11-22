import { Music2, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMusicServiceConnection, MusicService } from "@/hooks/useMusicServiceConnection";

export const MusicServiceSelector = () => {
  const { isConnected, connectService, disconnectService, loading } = useMusicServiceConnection();

  const services: { id: MusicService; name: string; icon: React.ReactNode; color: string }[] = [
    {
      id: "spotify",
      name: "Spotify",
      icon: <Music2 className="h-8 w-8" />,
      color: "from-green-500 to-green-600",
    },
    {
      id: "youtube_music",
      name: "YouTube Music",
      icon: <Youtube className="h-8 w-8" />,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => {
        const connected = isConnected(service.id);
        
        return (
          <Card key={service.id} className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center text-white`}>
                {service.icon}
              </div>
              
              <h3 className="text-xl font-semibold">{service.name}</h3>
              
              {connected ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                    Đã kết nối
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectService(service.id)}
                    disabled={loading}
                  >
                    Ngắt kết nối
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => connectService(service.id)}
                  disabled={loading}
                  className="w-full"
                >
                  Kết nối với {service.name}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
