import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAmbientAudio } from "@/components/AmbientAudio";

export type HeroSoundHandle = { start: () => Promise<void> };

export const HeroSound = forwardRef<HeroSoundHandle, { language: "pt" | "en"; onPlayingChange?: (playing: boolean) => void; onMutedChange?: (muted: boolean) => void }>(function HeroSound({ language, onPlayingChange, onMutedChange }, ref) {
  const { playing, muted, toneContext, start, pause, toggleMuted } = useAmbientAudio();
  const english = language === "en";
  const toneLabel = english ? { guitar: "Guitar", acoustic: "Acoustic guitar", effects: "Pedals and amplifiers", neutral: "Instrument ambience" }[toneContext] : { guitar: "Guitarra", acoustic: "Violão", effects: "Pedais e amplificadores", neutral: "Ambientação instrumental" }[toneContext];
  const copy = english ? { start: `Play ${toneLabel} ambience`, pause: "Pause ambience", unmute: "Turn sound on", mute: "Mute sound", idle: `${toneLabel} ambience is off`, active: `${toneLabel} ambience is playing` } : { start: `Ouvir ${toneLabel}`, pause: "Pausar ambientação", unmute: "Ativar som", mute: "Silenciar som", idle: `${toneLabel} desligado`, active: `${toneLabel} tocando` };

  useEffect(() => { onPlayingChange?.(playing); }, [playing, onPlayingChange]);
  useEffect(() => { onMutedChange?.(muted); }, [muted, onMutedChange]);
  useImperativeHandle(ref, () => ({ start }));

  return <div className="mb-7 flex flex-wrap items-center gap-2" aria-label={english ? "Hero sound controls" : "Controles de som do destaque"}>
    <button type="button" onClick={playing ? pause : start} aria-label={playing ? copy.pause : copy.start} aria-pressed={playing} className="inline-flex h-10 items-center gap-2 rounded-full border border-red-400/35 bg-red-500/10 px-4 text-xs font-bold text-red-100 transition hover:border-red-300/70 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c] active:scale-[.97]">{playing ? <Pause size={15} fill="currentColor" /> : <><Music2 size={15} /><Play size={13} fill="currentColor" /></>}<span>{playing ? copy.pause : copy.start}</span></button>
    {playing && <button type="button" onClick={toggleMuted} aria-label={muted ? copy.unmute : copy.mute} aria-pressed={muted} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[.06] text-white/75 transition hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c] active:scale-[.97]">{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>}
    <span className="sr-only" aria-live="polite">{playing ? copy.active : copy.idle}</span>
  </div>;
});
