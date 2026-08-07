"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

type PortfolioSoundType = "hi" | "yawn" | "arcade-hit" | "grow";

type PortfolioSoundContextValue = {
  play: (type: PortfolioSoundType) => void;
};

const PortfolioSoundContext = createContext<PortfolioSoundContextValue | null>(null);

function supportsAudio() {
  return typeof window !== "undefined" && "AudioContext" in window;
}

export function PortfolioSoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  const getAudio = useCallback(() => {
    if (!supportsAudio()) return null;
    audioRef.current ??= new AudioContext();
    return audioRef.current;
  }, []);

  const unlock = useCallback(() => {
    const audio = getAudio();
    if (!audio) return;
    void audio.resume();
    unlockedRef.current = true;
  }, [getAudio]);

  const tone = useCallback(
    (frequency: number, startAt: number, duration: number, options?: { type?: OscillatorType; gain?: number }) => {
      const audio = getAudio();
      if (!audio || !unlockedRef.current) return;

      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = options?.type ?? "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(options?.gain ?? 0.08, startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.03);
    },
    [getAudio]
  );

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!unlockedRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 1;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 0.45;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const play = useCallback(
    (type: PortfolioSoundType) => {
      const audio = getAudio();
      if (!audio || !unlockedRef.current) return;
      const now = audio.currentTime;

      if (type === "hi") {
        tone(660, now, 0.08, { type: "triangle", gain: 0.045 });
        tone(880, now + 0.08, 0.1, { type: "triangle", gain: 0.04 });
        speak("Hi, I'm Yash.", { rate: 1.05, pitch: 1.18, volume: 0.5 });
        return;
      }

      if (type === "yawn") {
        tone(220, now, 0.22, { type: "sine", gain: 0.025 });
        tone(174, now + 0.16, 0.28, { type: "sine", gain: 0.018 });
        speak("Good night.", { rate: 0.78, pitch: 0.82, volume: 0.38 });
        return;
      }

      if (type === "arcade-hit") {
        tone(196, now, 0.055, { type: "square", gain: 0.05 });
        tone(132, now + 0.045, 0.07, { type: "square", gain: 0.035 });
        return;
      }

      tone(523, now, 0.07, { type: "square", gain: 0.04 });
      tone(659, now + 0.07, 0.07, { type: "square", gain: 0.04 });
      tone(784, now + 0.14, 0.12, { type: "square", gain: 0.045 });
    },
    [getAudio, speak, tone]
  );

  useEffect(() => {
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [unlock]);

  useEffect(() => {
    const onSound = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: PortfolioSoundType }>).detail;
      if (detail?.type) play(detail.type);
    };
    window.addEventListener("portfolio:sound", onSound);
    return () => window.removeEventListener("portfolio:sound", onSound);
  }, [play]);

  const value = useMemo(() => ({ play }), [play]);

  return <PortfolioSoundContext.Provider value={value}>{children}</PortfolioSoundContext.Provider>;
}

export function usePortfolioSound() {
  const context = useContext(PortfolioSoundContext);
  if (!context) {
    throw new Error("usePortfolioSound must be used inside PortfolioSoundProvider");
  }
  return context;
}
