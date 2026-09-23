import React from "react";
import { Guitar } from "lucide-react";

const HERO_CONCEPT_GUITAR = "/media/tone-concept-guitar-stage_e1fc0821.png";

export function HeroGuitarStage({ playing, muted, language, onActivate }: { playing: boolean; muted: boolean; language: "pt" | "en"; onActivate: () => void }) {
  const english = language === "en";
  const status = !playing ? (english ? "Press play to wake the guitar" : "Ative o som para acordar a guitarra") : muted ? (english ? "Guitar resonance is active · sound muted" : "Ressonância da guitarra ativa · som silenciado") : (english ? "The guitar is resonating" : "A guitarra está ressoando");
  const reach = english ? "Brazil & worldwide" : "Brasil e exterior";

  return <div className="absolute inset-0 overflow-hidden" aria-label={status}>
    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_64%_38%,rgba(151,20,29,.42),transparent_25%),linear-gradient(135deg,#16090c_0%,#0b0b0e_48%,#211014_100%)] transition duration-700 ${playing ? "opacity-100" : "opacity-60"}`} />
    <img src={HERO_CONCEPT_GUITAR} alt="" className={`tone-guitar-art absolute inset-0 h-full w-full object-cover object-[58%_25%] transition duration-700 sm:object-[62%_28%] lg:object-[75%_center] ${playing ? "opacity-90" : "opacity-55 grayscale-[.3]"}`} data-active={playing} data-muted={muted} />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0b0b0c_0%,rgba(11,11,12,.15)_28%,#0b0b0c_57%,#0b0b0c_100%)] lg:bg-[linear-gradient(90deg,#0b0b0c_0%,#0b0b0c_35%,rgba(11,11,12,.65)_55%,rgba(11,11,12,.16)_100%)]" />
    <div className="tone-orbit pointer-events-none absolute left-1/2 top-[27%] h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-300/15 sm:top-[30%] sm:h-[34rem] sm:w-[34rem] lg:left-[75%] lg:top-1/2 lg:h-[42rem] lg:w-[42rem]" data-active={playing} data-muted={muted} />
    <div className="pointer-events-none absolute left-1/2 top-[27%] flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 opacity-80 lg:left-[75%] lg:top-1/2" aria-hidden="true">{[0, 1, 2, 3, 4].map(index => <span key={index} className="tone-string h-px w-48 bg-gradient-to-r from-transparent via-red-200/80 to-transparent sm:w-72" style={{ animationDelay: `${index * 120}ms` }} data-active={playing} data-muted={muted} />)}</div>
    <div className="absolute right-5 top-5 flex flex-col items-end gap-1 sm:right-8 sm:top-7"><span className="rounded-full border border-red-200/20 bg-black/45 px-3 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-red-100/85 backdrop-blur">{reach}</span><div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/85 backdrop-blur"><span className={`h-2 w-2 rounded-full ${playing && !muted ? "animate-pulse bg-red-400 shadow-[0_0_12px_rgba(248,113,113,.9)]" : "bg-white/35"}`} />{playing ? (english ? "Tone resonance" : "Ressonância Tone") : (english ? "Tone signal" : "Sinal Tone")}</div></div>
    {!playing && <button type="button" onClick={onActivate} aria-label={english ? "Wake the guitar" : "Acordar a guitarra"} className="absolute left-1/2 top-[19rem] -translate-x-1/2 rounded-full border border-red-200/35 bg-red-700/55 px-4 py-2.5 text-xs font-bold text-white shadow-[0_12px_30px_rgba(127,29,29,.36)] backdrop-blur transition hover:-translate-y-1 hover:bg-red-600/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:top-[25rem] lg:left-auto lg:right-12 lg:top-auto lg:bottom-12 lg:translate-x-0"><Guitar className="mr-2 inline-block" size={15} />{english ? "Wake the guitar" : "Acordar a guitarra"}</button>}
  </div>;
}
