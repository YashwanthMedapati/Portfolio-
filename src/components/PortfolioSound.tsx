"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type PortfolioSoundType = "hi" | "need-help" | "yawn" | "goodnight" | "arcade-hit" | "grow";

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
  // A couple of cents-detuned voices summed together read as a warm, sung
  // "aah" instead of one bare oscillator's flat, robotic buzz - the same
  // trick real synths use for chorus/unison patches.
  chorus?: boolean;
  // Rolls off the harsh upper harmonics a raw oscillator produces, which is
  // most of what makes a single tone sound synthetic/robotic in the first place.
  filterHz?: number;
};

const PortfolioSoundContext = createContext<PortfolioSoundContextValue | null>(null);
const SOUND_STORAGE_KEY = "portfolio-sound-enabled";
const VOICE_SOUNDS: Partial<Record<PortfolioSoundType, string>> = {
  hi: "/sounds/yash-intro.mp3",
  "need-help": "/sounds/yash-need-help.mp3",
  yawn: "/sounds/yash-goodnight-yawn.mp3",
  goodnight: "/sounds/yash-goodnight.mp3",
};

function supportsAudio() {
  return (
    typeof window !== "undefined" &&
    ("AudioContext" in window || "webkitAudioContext" in window)
  );
}

function createAudioContext() {
  const AudioContextCtor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AudioContextCtor ? new AudioContextCtor() : null;
}

export function PortfolioSoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<AudioContext | null>(null);
  const voiceRefs = useRef<Partial<Record<PortfolioSoundType, HTMLAudioElement>>>({});
  const unlockedRef = useRef(false);
  // Must start false on both server and client's first render - SSR has no
  // localStorage, so a lazy initializer reading it here is exactly what
  // caused the SoundToggle hydration mismatch (server always rendered
  // "off," client could immediately render "on"). Corrected via effect below.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SOUND_STORAGE_KEY) === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe correction from localStorage, mirrors ThemeContext's pattern
        setEnabled(true);
      }
    } catch {}
  }, []);

  const getAudio = useCallback(() => {
    if (!supportsAudio()) return null;
    audioRef.current ??= createAudioContext();
    return audioRef.current;
  }, []);

  const unlock = useCallback(() => {
    const audio = getAudio();
    if (!audio) return null;
    void audio.resume().then(() => {
      unlockedRef.current = true;
    }).catch(() => {});
    unlockedRef.current = true;
    return audio;
  }, [getAudio]);

  const confirmationChime = useCallback((audio: AudioContext) => {
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }, []);

  const setSoundEnabled = useCallback(
    (nextEnabled: boolean) => {
      setEnabled(nextEnabled);
      try {
        window.localStorage.setItem(SOUND_STORAGE_KEY, String(nextEnabled));
      } catch {}
      if (nextEnabled) {
        const audio = unlock();
        if (audio) confirmationChime(audio);
      }
    },
    [confirmationChime, unlock]
  );

  const toggleEnabled = useCallback(() => {
    setSoundEnabled(!enabled);
  }, [enabled, setSoundEnabled]);

  const playVoiceSound = useCallback((type: PortfolioSoundType) => {
    const src = VOICE_SOUNDS[type];
    if (!src) return false;

    const voice = voiceRefs.current[type] ?? new Audio(src);
    voiceRefs.current[type] = voice;
    voice.volume = type === "yawn" ? 0.85 : 1;
    voice.currentTime = 0;
    void voice.play().catch(() => {});
    return true;
  }, []);

  const tone = useCallback(
    (frequency: number, startAt: number, duration: number, options?: ToneOptions) => {
      const audio = getAudio();
      if (!audio || !unlockedRef.current) return;

      const voices = options?.chorus ? [0, -8, 8] : [0];
      const peakGain = (options?.gain ?? 0.045) * (options?.chorus ? 0.6 : 1);

      for (const detuneOffset of voices) {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = options?.type ?? "sine";
        oscillator.frequency.setValueAtTime(frequency, startAt);
        oscillator.detune.setValueAtTime((options?.detune ?? 0) + detuneOffset, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(peakGain, startAt + (options?.attack ?? 0.018));
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration + (options?.release ?? 0));

        let outputNode: AudioNode = gain;
        if (options?.filterHz) {
          const filter = audio.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(options.filterHz, startAt);
          filter.Q.setValueAtTime(0.7, startAt);
          gain.connect(filter);
          outputNode = filter;
        }

        oscillator.connect(gain);
        outputNode.connect(audio.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + duration + (options?.release ?? 0.04));
      }
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
      if (!enabled) return;
      const audio = getAudio();
      if (unlockedRef.current && playVoiceSound(type)) return;
      if (!audio) return;
      if (!unlockedRef.current || audio.state === "suspended") {
        void audio.resume().then(() => {
          unlockedRef.current = true;
          window.dispatchEvent(new CustomEvent("portfolio:sound", { detail: { type } }));
        }).catch(() => {});
        return;
      }
      if (playVoiceSound(type)) return;
      const now = audio.currentTime;

      if (type === "hi") {
        // A soft, sung-feeling greeting blip: chorus voices instead of one
        // bare oscillator, gentler triangle/sine waves (no square anywhere
        // here), a slower attack, and a lowpass to round off the buzz.
        tone(523.25, now, 0.09, { type: "triangle", gain: 0.036, attack: 0.03, release: 0.045, chorus: true, filterHz: 2600 });
        tone(659.25, now + 0.08, 0.09, { type: "triangle", gain: 0.035, attack: 0.03, release: 0.045, chorus: true, filterHz: 2600 });
        tone(783.99, now + 0.17, 0.16, { type: "sine", gain: 0.038, attack: 0.035, release: 0.09, chorus: true, filterHz: 3200 });
        tone(1567.98, now + 0.175, 0.12, { type: "sine", gain: 0.01, attack: 0.035, release: 0.06 });
        return;
      }

      if (type === "yawn") {
        tone(246.94, now, 0.32, { type: "sine", gain: 0.022, attack: 0.05, release: 0.14, chorus: true, filterHz: 1400 });
        tone(196, now + 0.2, 0.36, { type: "sine", gain: 0.019, attack: 0.06, release: 0.2, chorus: true, filterHz: 1200 });
        noise(now + 0.08, 0.34, { gain: 0.007, frequency: 380, type: "lowpass" });
        return;
      }

      if (type === "goodnight") {
        // A soft, descending two-note "mm, night" cadence - warm and
        // resolved, distinct from the airy yawn exhale that precedes it.
        tone(392, now, 0.22, { type: "sine", gain: 0.026, attack: 0.05, release: 0.16, chorus: true, filterHz: 1500 });
        tone(293.66, now + 0.24, 0.34, { type: "sine", gain: 0.022, attack: 0.07, release: 0.28, chorus: true, filterHz: 1200 });
        return;
      }

      if (type === "arcade-hit") {
        // A bright, snappy "tink-tink" - the classic ? -block tap - instead
        // of a low descending thud. Percussive on purpose: this one voice
        // should stay a crisp mechanical bonk, not warmed up like the others.
        tone(1046.5, now, 0.028, { type: "square", gain: 0.03, attack: 0.002, release: 0.012 });
        tone(830.61, now + 0.024, 0.032, { type: "square", gain: 0.026, attack: 0.002, release: 0.016 });
        noise(now, 0.035, { gain: 0.022, frequency: 2400, type: "highpass" });
        return;
      }

      tone(261.63, now, 0.08, { type: "triangle", gain: 0.032, attack: 0.02, release: 0.035, chorus: true, filterHz: 3000 });
      tone(329.63, now + 0.075, 0.08, { type: "triangle", gain: 0.032, attack: 0.02, release: 0.035, chorus: true, filterHz: 3000 });
      tone(392, now + 0.15, 0.08, { type: "triangle", gain: 0.034, attack: 0.02, release: 0.035, chorus: true, filterHz: 3200 });
      tone(523.25, now + 0.225, 0.15, { type: "sine", gain: 0.038, attack: 0.025, release: 0.09, chorus: true, filterHz: 3600 });
    },
    [enabled, getAudio, noise, playVoiceSound, tone]
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    Object.entries(VOICE_SOUNDS).forEach(([type, src]) => {
      const voice = voiceRefs.current[type as PortfolioSoundType] ?? new Audio(src);
      voice.preload = "auto";
      voiceRefs.current[type as PortfolioSoundType] = voice;
    });
  }, [enabled]);

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
