import { useState, useRef, useEffect, useCallback } from "react";

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  artist_name?: string;
  album_id?: string;
  audio_url: string;
  cover_url?: string;
  duration: number;
  lyrics?: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "one" | "all";
  queue: Song[];
  currentIndex: number;
}

export const useMusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 70,
    isMuted: false,
    isShuffled: false,
    repeatMode: "off",
    queue: [],
    currentIndex: -1,
  });

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener("timeupdate", () => {
        setState(prev => ({ ...prev, currentTime: audioRef.current!.currentTime }));
      });
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        setState(prev => ({ ...prev, duration: audioRef.current!.duration }));
      });
      
      audioRef.current.addEventListener("ended", handleSongEnd);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleSongEnd = useCallback(() => {
    if (state.repeatMode === "one") {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
    } else if (state.repeatMode === "all" || state.currentIndex < state.queue.length - 1) {
      playNext();
    } else {
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [state.repeatMode, state.currentIndex, state.queue.length]);

  const playSong = useCallback((song: Song, queue?: Song[], startIndex?: number) => {
    if (!audioRef.current) return;

    audioRef.current.src = song.audio_url;
    audioRef.current.volume = state.volume / 100;
    
    setState(prev => ({
      ...prev,
      currentSong: song,
      queue: queue || [song],
      currentIndex: startIndex ?? 0,
      isPlaying: true,
    }));
    
    audioRef.current.play();
  }, [state.volume]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !state.currentSong) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [state.isPlaying, state.currentSong]);

  const playNext = useCallback(() => {
    if (state.queue.length === 0) return;
    
    let nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.queue.length) {
      nextIndex = 0;
    }
    
    playSong(state.queue[nextIndex], state.queue, nextIndex);
  }, [state.queue, state.currentIndex, playSong]);

  const playPrevious = useCallback(() => {
    if (state.queue.length === 0) return;
    
    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.queue.length - 1;
    }
    
    playSong(state.queue[prevIndex], state.queue, prevIndex);
  }, [state.queue, state.currentIndex, playSong]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (state.isMuted) {
      audioRef.current.volume = state.volume / 100;
    } else {
      audioRef.current.volume = 0;
    }
    
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [state.isMuted, state.volume]);

  const toggleShuffle = useCallback(() => {
    setState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  }, []);

  const cycleRepeat = useCallback(() => {
    setState(prev => {
      const modes: Array<"off" | "one" | "all"> = ["off", "one", "all"];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      return { ...prev, repeatMode: nextMode };
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, song] }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter((_, i) => i !== index),
    }));
  }, []);

  return {
    ...state,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    addToQueue,
    removeFromQueue,
  };
};
