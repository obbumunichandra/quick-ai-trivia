import React, { createContext, useState, useRef, ReactNode, useContext, useCallback, useEffect } from 'react';

// Using a stable, public domain URL to ensure the audio source loads correctly and prevent playback errors.
const BGM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

interface AudioContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  volume: number;
  changeVolume: (newVolume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const isInitialized = useRef(false);

  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleMusic = useCallback(async () => {
    // Lazy-initialize the Audio element on the first user gesture to comply with browser policies.
    if (!isInitialized.current) {
      audioRef.current = new Audio(BGM_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = volume; // Set initial volume
      isInitialized.current = true;
    }
    
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback failed:", error);
        setIsPlaying(false);
      }
    }
  }, [isPlaying, volume]);

  return (
    <AudioContext.Provider value={{ isPlaying, toggleMusic, volume, changeVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};