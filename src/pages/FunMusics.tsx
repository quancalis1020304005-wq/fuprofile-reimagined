import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, List, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

const FunMusics = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [progress, setProgress] = useState([30]);

  const playlist = [
    { id: 1, title: "Starlight Dreams", artist: "Luna Bay", duration: "3:45", cover: "🎵" },
    { id: 2, title: "Midnight Vibes", artist: "The Echoes", duration: "4:12", cover: "🎸" },
    { id: 3, title: "Summer Breeze", artist: "Coastal Drift", duration: "3:28", cover: "🌊" },
    { id: 4, title: "Electric Soul", artist: "Neon Pulse", duration: "4:55", cover: "⚡" },
    { id: 5, title: "Morning Coffee", artist: "Jazz Collective", duration: "3:15", cover: "☕" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          FunMusics
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Now Playing */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex flex-col items-center">
                {/* Album Art */}
                <div className="w-64 h-64 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-8xl mb-6 shadow-lg">
                  {playlist[currentSong].cover}
                </div>

                {/* Song Info */}
                <h2 className="text-3xl font-bold mb-2">{playlist[currentSong].title}</h2>
                <p className="text-muted-foreground mb-6">{playlist[currentSong].artist}</p>

                {/* Progress Bar */}
                <div className="w-full mb-6">
                  <Slider
                    value={progress}
                    onValueChange={setProgress}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>1:23</span>
                    <span>{playlist[currentSong].duration}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentSong((prev) => (prev > 0 ? prev - 1 : playlist.length - 1))}
                    className="h-12 w-12"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>

                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    size="icon"
                    className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" fill="currentColor" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" fill="currentColor" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentSong((prev) => (prev < playlist.length - 1 ? prev + 1 : 0))}
                    className="h-12 w-12"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </div>

                {/* Volume & Actions */}
                <div className="flex items-center gap-6 w-full max-w-md">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2 flex-1">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>

                  <Button variant="ghost" size="icon">
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Playlist */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Music2 className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Playlist</h3>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {playlist.map((song, index) => (
                    <button
                      key={song.id}
                      onClick={() => setCurrentSong(index)}
                      className={`w-full p-4 rounded-lg text-left transition-all hover:bg-accent/50 ${
                        currentSong === index ? "bg-primary/10 border border-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{song.cover}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{song.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{song.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunMusics;
