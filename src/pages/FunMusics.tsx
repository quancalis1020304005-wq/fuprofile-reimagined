import { useState, useEffect } from "react";
import { Search, Plus, Heart, Music2, TrendingUp, Clock, Link2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MusicPlayer } from "@/components/MusicPlayer";
import { MusicServiceSelector } from "@/components/MusicServiceSelector";
import { useMusicPlayer, Song } from "@/hooks/useMusicPlayer";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useMusicServiceConnection } from "@/hooks/useMusicServiceConnection";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FunMusics = () => {
  const playerState = useMusicPlayer();
  const spotifyPlayer = useSpotifyPlayer();
  const { playlists, createPlaylist, loading: playlistsLoading } = usePlaylists();
  const { isConnected, loading: connectionsLoading } = useMusicServiceConnection();
  const { toast } = useToast();
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [loading, setLoading] = useState(true);
  const [musicSource, setMusicSource] = useState<'database' | 'spotify'>('database');

  useEffect(() => {
    if (!connectionsLoading) {
      fetchSongs();
      fetchLikedSongs();
    }
  }, [connectionsLoading, isConnected]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      
      // Check if Spotify is connected
      const spotifyConnected = isConnected('spotify');
      console.log('Spotify connected:', spotifyConnected);
      
      if (spotifyConnected) {
        console.log('Fetching from Spotify...');
        setMusicSource('spotify');
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        const { data, error } = await supabase.functions.invoke('spotify-tracks', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        if (data?.error) {
          // Show error from edge function (e.g., Spotify Development mode restriction)
          toast({
            title: "Lỗi Spotify",
            description: data.error,
            variant: "destructive",
          });
          if (data.details) {
            console.error('Spotify error details:', data.details);
          }
          // Fall back to database songs
          setMusicSource('database');
        } else if (data?.songs && data.songs.length > 0) {
          setSongs(data.songs);
          toast({
            title: "Thành công",
            description: `Đã tải ${data.songs.length} bài hát từ Spotify`,
          });
          return;
        }
      }
      
      // Fallback to database songs
      console.log('Fetching from database...');
      setMusicSource('database');
      
      const { data, error } = await supabase
        .from("songs")
        .select(`
          *,
          artists:artist_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedSongs: Song[] = (data || []).map((song: any) => ({
        id: song.id,
        title: song.title,
        artist_id: song.artist_id,
        artist_name: song.artists?.name,
        album_id: song.album_id,
        audio_url: song.audio_url,
        cover_url: song.cover_url,
        duration: song.duration,
        lyrics: song.lyrics,
      }));

      setSongs(formattedSongs);
    } catch (error: any) {
      console.error('Error fetching songs:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách bài hát",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedSongs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("liked_songs")
        .select("song_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setLikedSongs(new Set(data?.map(ls => ls.song_id) || []));
    } catch (error: any) {
      console.error("Error fetching liked songs:", error);
    }
  };

  const toggleLike = async (songId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để thích bài hát",
          variant: "destructive",
        });
        return;
      }

      const isLiked = likedSongs.has(songId);

      if (isLiked) {
        const { error } = await supabase
          .from("liked_songs")
          .delete()
          .eq("user_id", user.id)
          .eq("song_id", songId);

        if (error) throw error;

        setLikedSongs(prev => {
          const newSet = new Set(prev);
          newSet.delete(songId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from("liked_songs")
          .insert({ user_id: user.id, song_id: songId });

        if (error) throw error;

        setLikedSongs(prev => new Set([...prev, songId]));
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName);
    setNewPlaylistName("");
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mockSongs: Song[] = [
    { id: "1", title: "Starlight Dreams", artist_id: "1", artist_name: "Luna Bay", audio_url: "", cover_url: "", duration: 225 },
    { id: "2", title: "Midnight Vibes", artist_id: "2", artist_name: "The Echoes", audio_url: "", cover_url: "", duration: 252 },
    { id: "3", title: "Summer Breeze", artist_id: "3", artist_name: "Coastal Drift", audio_url: "", cover_url: "", duration: 208 },
  ];

  const displaySongs = songs.length > 0 ? filteredSongs : mockSongs;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 p-4 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FunMusics
            </h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo Playlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo Playlist Mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Tên playlist..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                  />
                  <Button onClick={handleCreatePlaylist} className="w-full">
                    Tạo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm bài hát, nghệ sĩ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="songs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="connect" className="gap-2">
                <Link2 className="h-4 w-4" />
                Liên kết
              </TabsTrigger>
              <TabsTrigger value="songs" className="gap-2">
                <Music2 className="h-4 w-4" />
                Bài Hát
              </TabsTrigger>
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                Nghe Gần Đây
              </TabsTrigger>
              <TabsTrigger value="liked" className="gap-2">
                <Heart className="h-4 w-4" />
                Yêu Thích
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connect" className="space-y-4">
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Lưu ý quan trọng:</strong> Để liên kết với Spotify, bạn cần có tài khoản Spotify (miễn phí hoặc Premium). 
                  Đăng nhập F.U Profile chỉ để truy cập ứng dụng, còn đăng nhập Spotify là để cấp quyền truy cập thư viện nhạc của bạn trên Spotify.
                  <br /><br />
                  <strong>Nếu chưa có tài khoản Spotify:</strong> Bạn có thể đăng ký miễn phí tại <a href="https://www.spotify.com/signup" target="_blank" rel="noopener noreferrer" className="underline font-semibold">spotify.com/signup</a>
                  <br /><br />
                  <strong>Chế độ Demo:</strong> Bạn có thể sử dụng tab "Bài Hát" để trải nghiệm giao diện với dữ liệu mẫu mà không cần liên kết Spotify.
                </AlertDescription>
              </Alert>
              
              <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Spotify Development Mode:</strong> App này đang ở chế độ Development. Nếu bạn gặp lỗi 403 sau khi kết nối, cần thêm email tài khoản Spotify của bạn vào allowlist tại{' '}
                  <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    developer.spotify.com/dashboard
                  </a>
                  {' '}→ Settings → User Management
                </AlertDescription>
              </Alert>
              
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Liên kết tài khoản nhạc</h2>
                <p className="text-muted-foreground mb-6">
                  Kết nối với Spotify hoặc YouTube Music để nghe nhạc từ thư viện của bạn
                </p>
                <MusicServiceSelector />
              </Card>
            </TabsContent>

            <TabsContent value="songs" className="space-y-4">
              {musicSource === 'spotify' && songs.length > 0 && (
                <>
                  {spotifyPlayer.playerState.isReady && spotifyPlayer.playerState.isPremium ? (
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-sm text-green-800 dark:text-green-300">
                        <strong>Spotify Premium đã kích hoạt:</strong> Bạn có thể phát nhạc toàn bộ từ {songs.length} bài hát trong thư viện Spotify!
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
                        <strong>Đã kết nối Spotify:</strong> Bạn đang xem {songs.length} bài hát. Để phát toàn bộ, cần tài khoản Spotify Premium. Hiện tại chỉ phát được preview 30 giây.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
              
              {songs.length === 0 && !loading && (
                <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Chế độ Demo:</strong> Bạn đang xem dữ liệu mẫu. Liên kết với Spotify (tab "Liên kết") để truy cập thư viện nhạc thật của bạn!
                  </AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <Card className="p-8 text-center text-muted-foreground">
                  Đang tải...
                </Card>
              ) : displaySongs.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  Không tìm thấy bài hát nào
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displaySongs.map((song) => (
                    <Card
                      key={song.id}
                      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => {
                        // If Spotify Premium is ready and song has Spotify URI, use Spotify player
                        if (spotifyPlayer.playerState.isReady && 
                            spotifyPlayer.playerState.isPremium && 
                            (song as any).external_url) {
                          const spotifyUri = `spotify:track:${song.id}`;
                          spotifyPlayer.play(spotifyUri);
                        } else {
                          // Otherwise use HTML5 audio with preview
                          playerState.playSong(song, displaySongs);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {song.cover_url ? (
                          <img
                            src={song.cover_url}
                            alt={song.title}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl">
                            🎵
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{song.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {song.artist_name || "Unknown Artist"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(song.id);
                          }}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              likedSongs.has(song.id) ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending">
              <Card className="p-8 text-center text-muted-foreground">
                Chức năng Trending đang phát triển...
              </Card>
            </TabsContent>

            <TabsContent value="recent">
              <Card className="p-8 text-center text-muted-foreground">
                Lịch sử nghe đang phát triển...
              </Card>
            </TabsContent>

            <TabsContent value="liked">
              <Card className="p-8 text-center text-muted-foreground">
                {likedSongs.size === 0 ? "Chưa có bài hát yêu thích" : "Danh sách bài hát yêu thích"}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer
        playerState={playerState}
        spotifyPlayerState={spotifyPlayer.playerState}
        onToggleLike={
          playerState.currentSong
            ? () => toggleLike(playerState.currentSong!.id)
            : undefined
        }
        isLiked={
          playerState.currentSong ? likedSongs.has(playerState.currentSong.id) : false
        }
      />
    </>
  );
};

export default FunMusics;
