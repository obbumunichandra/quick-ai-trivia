import React, { createContext, useState, useRef, ReactNode, useContext, useCallback } from 'react';

// A short, public domain "plop" sound, embedded as a Base64 Data URI.
// This is reliable as it requires no network request and works across browsers.
const TOUCH_SOUND_DATA_URI = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAYAAAA/v/8/f79/v7+/v79/v3+/P78/v3+/f78/vz+AQACAAH+/v7+/v79/v4=';

interface SoundContextType {
  soundEffectsEnabled: boolean;
  toggleSoundEffects: () => void;
  playClickSound: () => void;
  volume: number;
  changeVolume: (newVolume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  // Use a ref to hold the audio object to avoid re-creating it on every render.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lazy initialize the Audio object. We only need one instance.
  if (audioRef.current === null) {
      audioRef.current = new Audio(TOUCH_SOUND_DATA_URI);
  }
  
  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if(audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const toggleSoundEffects = () => {
    setSoundEffectsEnabled(prev => !prev);
  };

  const playClickSound = useCallback(() => {
    if (soundEffectsEnabled && audioRef.current) {
        // Resetting the time allows the sound to be played again quickly.
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // This can happen if the user hasn't interacted with the page yet,
                // or if there's another issue.
                console.error("Touch sound playback failed:", error);
            });
        }
    }
  }, [soundEffectsEnabled]);
  
  // Initialize volume on mount
  useState(() => {
    if(audioRef.current) {
      audioRef.current.volume = volume;
    }
  });

  return (
    <SoundContext.Provider value={{ soundEffectsEnabled, toggleSoundEffects, playClickSound, volume, changeVolume }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};