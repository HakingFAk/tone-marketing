import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToneContext = "guitar" | "acoustic" | "effects" | "neutral";

const tracks: Record<ToneContext, string> = {
  guitar: "/media/tone-electric-guitar-context_63a3e573.mp3",
  acoustic: "/media/tone-acoustic-guitar-context_dfc7a9d1.mp3",
  effects: "/media/tone-effects-amp-context_a4eed5be.mp3",
  neutral: "/media/tone-electric-guitar-context_63a3e573.mp3",
};

type AmbientAudioState = {
  toneContext: ToneContext;
  setToneContext: (context: ToneContext) => void;
  playing: boolean;
  muted: boolean;
  setTrackUrl: (context: ToneContext, url: string) => void;
  start: () => Promise<void>;
  pause: () => void;
  toggleMuted: () => void;
};

const fallbackAmbientAudio: AmbientAudioState = {
  toneContext: "guitar",
  setToneContext: () => undefined,
  playing: false,
  muted: false,
  start: async () => undefined,
  pause: () => undefined,
  toggleMuted: () => undefined,
  setTrackUrl: () => undefined,
};
const AmbientAudioContext = createContext<AmbientAudioState>(fallbackAmbientAudio);

export function toneContextForCategory(category?: string | null): ToneContext {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("viol")) return "acoustic";
  if (normalized.includes("pedal") || normalized.includes("pedai") || normalized.includes("amplificador")) return "effects";
  if (normalized.includes("guitarra")) return "guitar";
  return "neutral";
}

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousSourceRef = useRef(tracks.guitar);
  const [toneContext, setToneContext] = useState<ToneContext>("guitar");
  const [managedTracks, setManagedTracks] = useState<Partial<Record<ToneContext, string>>>({});
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const currentTrack = managedTracks[toneContext] || tracks[toneContext];

  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.18;
    audio.muted = false;
    setMuted(false);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggleMuted = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);
  }, [muted]);

  const setTrackUrl = useCallback((context: ToneContext, url: string) => setManagedTracks(current => current[context] === url ? current : { ...current, [context]: url }), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (previousSourceRef.current === currentTrack) return;
    previousSourceRef.current = currentTrack;
    const wasPlaying = playing;
    audio.pause();
    audio.src = currentTrack;
    audio.load();
    if (!wasPlaying) return;
    audio.volume = muted ? 0.18 : 0.035;
    audio.muted = muted;
    audio.play().then(() => {
      if (!muted) window.setTimeout(() => { if (audioRef.current === audio) audio.volume = 0.18; }, 260);
    }).catch(() => setPlaying(false));
  }, [currentTrack, muted, playing]);

  const value = useMemo(() => ({ toneContext, setToneContext, playing, muted, start, pause, toggleMuted, setTrackUrl }), [toneContext, playing, muted, start, pause, toggleMuted, setTrackUrl]);
  return <AmbientAudioContext.Provider value={value}><audio ref={audioRef} src={currentTrack} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={() => setMuted(audioRef.current?.muted ?? false)} />{children}</AmbientAudioContext.Provider>;
}

export function useAmbientAudio() {
  return useContext(AmbientAudioContext);
}
