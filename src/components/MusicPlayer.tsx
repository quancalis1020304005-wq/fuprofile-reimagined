import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Heart, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";

interface MusicPlayerProps {
  playerState: ReturnType<typeof useMusicPlayer>;
  onToggleLike?: () => void;
  isLiked?: boolean;
}

export const MusicPlayer = ({ playerState, onToggleLike, isLiked }: MusicPlayerProps) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = playerState;

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getRepeatIcon = () => {
    if (repeatMode === "one") return <Repeat1 className="h-4 w-4" />;
    return <Repeat className="h-4 w-4" />;
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Song Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {currentSong.cover_url ? (
              <img
                src={currentSong.cover_url}
                alt={currentSong.title}
                className="w-14 h-14 rounded-md object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                🎵
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{currentSong.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {currentSong.artist_name || "Unknown Artist"}
              </p>
            </div>
            {onToggleLike && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleLike}
                className="flex-shrink-0"
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            )}
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={`h-8 w-8 ${isShuffled ? "text-primary" : ""}`}
              >
                <Shuffle className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={playPrevious}
                className="h-8 w-8"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                onClick={togglePlay}
                size="icon"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-8 w-8"
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={cycleRepeat}
                className={`h-8 w-8 ${repeatMode !== "off" ? "text-primary" : ""}`}
              >
                {getRepeatIcon()}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={([value]) => seek(value)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ListMusic className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={([value]) => setVolume(value)}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
