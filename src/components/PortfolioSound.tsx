"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type PortfolioSoundType = "hi" | "yawn" | "arcade-hit" | "grow";

type PortfolioSoundContextValue = {
  enabled: boolean;
  toggleEnabled: () => void;
  play: (type: PortfolioSoundType) => void;
};

type ToneOptions = {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  detune?: number;
};

const PortfolioSoundContext = createContext<PortfolioSoundContextValue | null>(null);
const SOUND_STORAGE_KEY = "portfolio-sound-enabled";

function supportsAudio() {
  return typeof window !== "undefined" && "AudioContext" in window;
}

export function PortfolioSoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(SOUND_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

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

  const setSoundEnabled = useCallback(
    (nextEnabled: boolean) => {
      setEnabled(nextEnabled);
      try {
        window.localStorage.setItem(SOUND_STORAGE_KEY, String(nextEnabled));
      } catch {}
      if (nextEnabled) unlock();
    },
    [unlock]
  );

  const toggleEnabled = useCallback(() => {
    setSoundEnabled(!enabled);
  }, [enabled, setSoundEnabled]);

  const tone = useCallback(
    (frequency: number, startAt: number, duration: number, options?: ToneOptions) => {
      const audio = getAudio();
      if (!audio || !unlockedRef.current) return;

      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = options?.type ?? "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      if (options?.detune) oscillator.detune.setValueAtTime(options.detune, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(options?.gain ?? 0.045, startAt + (options?.attack ?? 0.018));
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration + (options?.release ?? 0));
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + (options?.release ?? 0.04));
    },
    [getAudio]
  );

  const noise = useCallback(
    (startAt: number, duration: number, options?: { gain?: number; frequency?: number; type?: BiquadFilterType }) => {
      const audio = getAudio();
      if (!audio || !unlockedRef.current) return;

      const samples = Math.max(1, Math.floor(audio.sampleRate * duration));
      const buffer = audio.createBuffer(1, samples, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < samples; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / samples);
      }

      const source = audio.createBufferSource();
      const filter = audio.createBiquadFilter();
      const gain = audio.createGain();
      filter.type = options?.type ?? "bandpass";
      filter.frequency.setValueAtTime(options?.frequency ?? 900, startAt);
      gain.gain.setValueAtTime(options?.gain ?? 0.025, startAt);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      source.start(startAt);
      source.stop(startAt + duration);
    },
    [getAudio]
  );

  const play = useCallback(
    (type: PortfolioSoundType) => {
      const audio = getAudio();
      if (!enabled || !audio || !unlockedRef.current) return;
      const now = audio.currentTime;

      if (type === "hi") {
        tone(523.25, now, 0.075, { type: "triangle", gain: 0.035, release: 0.025 });
        tone(659.25, now + 0.07, 0.075, { type: "triangle", gain: 0.034, release: 0.025 });
        tone(783.99, now + 0.15, 0.12, { type: "sine", gain: 0.038, release: 0.06 });
        tone(1567.98, now + 0.155, 0.09, { type: "sine", gain: 0.012, release: 0.04 });
        return;
      }

      if (type === "yawn") {
        tone(246.94, now, 0.28, { type: "sine", gain: 0.024, release: 0.1 });
        tone(196, now + 0.18, 0.32, { type: "sine", gain: 0.02, release: 0.16 });
        noise(now + 0.08, 0.34, { gain: 0.009, frequency: 420, type: "lowpass" });
        return;
      }

      if (type === "arcade-hit") {
        tone(164.81, now, 0.045, { type: "square", gain: 0.035, release: 0.01 });
        tone(98, now + 0.035, 0.055, { type: "triangle", gain: 0.035, release: 0.02 });
        noise(now, 0.055, { gain: 0.018, frequency: 1200 });
        return;
      }

      tone(261.63, now, 0.075, { type: "triangle", gain: 0.032, release: 0.03 });
      tone(329.63, now + 0.075, 0.075, { type: "triangle", gain: 0.032, release: 0.03 });
      tone(392, now + 0.15, 0.075, { type: "triangle", gain: 0.034, release: 0.03 });
      tone(523.25, now + 0.225, 0.14, { type: "sine", gain: 0.038, release: 0.08 });
    },
    [enabled, getAudio, noise, tone]
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

  const value = useMemo(() => ({ enabled, toggleEnabled, play }), [enabled, toggleEnabled, play]);

  return <PortfolioSoundContext.Provider value={value}>{children}</PortfolioSoundContext.Provider>;
}

export function usePortfolioSound() {
  const context = useContext(PortfolioSoundContext);
  if (!context) {
    throw new Error("usePortfolioSound must be used inside PortfolioSoundProvider");
  }
  return context;
}
