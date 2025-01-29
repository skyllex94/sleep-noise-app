import { createContext, useContext, useState } from "react";
import { Audio } from "expo-av";

type SoundContextType = {
  sound: Audio.Sound | null;
  setSound: (sound: Audio.Sound | null) => void;
  isPlaying: string | null;
  setIsPlaying: (name: string | null) => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  return (
    <SoundContext.Provider value={{ sound, setSound, isPlaying, setIsPlaying }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (undefined === context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
