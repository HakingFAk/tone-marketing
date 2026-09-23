import React, { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export const nextMutedState = (muted: boolean) => !muted;

export function VideoPlayer({ src, title, language, className = "" }: { src: string; title: string; language: "pt" | "en"; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const english = language === "en";
  const toggleAudio = () => {
    const nextMuted = nextMutedState(muted);
    if (videoRef.current) videoRef.current.muted = nextMuted;
    setMuted(nextMuted);
  };
  const label = muted ? (english ? "Turn on video sound" : "Ativar som do vídeo") : (english ? "Mute video sound" : "Silenciar vídeo");

  return <div className={`relative overflow-hidden bg-black ${className}`}><video ref={videoRef} controls playsInline preload="metadata" muted={muted} onVolumeChange={() => setMuted(videoRef.current?.muted ?? false)} className="aspect-video w-full bg-black" src={src} aria-label={title}/><button type="button" onClick={toggleAudio} aria-label={label} aria-pressed={muted} title={label} className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white shadow-lg transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95">{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button></div>;
}
