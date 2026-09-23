import React from "react";
import { Globe2, PlayCircle, Video } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { VideoPlayer } from "@/components/VideoPlayer";

type VideoKind = "demo" | "client";

function VideoStrip({ kind, language }: { kind: VideoKind; language: "pt" | "en" }) {
  const { data: videos = [], isLoading } = trpc.videos.list.useQuery({ kind });
  const demo = kind === "demo";
  const copy = language === "en"
    ? {
        eyebrow: demo ? "Instrument demos" : "Tone worldwide sessions",
        title: demo ? "See the instrument before the conversation." : "Real players. Real instruments. With permission.",
        body: demo ? "Close details, controls and sound references from the exact gear available at Tone." : "A separate space for customers who authorize us to share their first sessions after delivery.",
        empty: demo ? "New instrument demos will appear here." : "Customer sessions will appear here after express authorization.",
      }
    : {
        eyebrow: demo ? "Demonstrações" : "Tone worldwide sessions",
        title: demo ? "Veja o instrumento antes da conversa." : "Músicos reais. Instrumentos reais. Com autorização.",
        body: demo ? "Detalhes, controles e referências de timbre do equipamento disponível na Tone." : "Um espaço separado para clientes que autorizam compartilhar suas primeiras sessões após receber o instrumento.",
        empty: demo ? "Novas demonstrações de instrumentos aparecerão aqui." : "Sessões de clientes aparecerão aqui após autorização expressa.",
      };

  return <section className={`rounded-3xl border p-5 sm:p-8 ${demo ? "border-red-500/20 bg-red-500/[.045]" : "border-white/10 bg-white/[.035]"}`}>
    <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr] lg:items-end"><div><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-red-400 sm:text-xs sm:tracking-[.22em]">{demo ? <PlayCircle size={15}/> : <Globe2 size={15}/>} {copy.eyebrow}</p><h2 className="mt-3 max-w-xl text-2xl font-black tracking-[-.04em] sm:text-4xl">{copy.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">{copy.body}</p></div>{videos.length > 0 && <span className="text-sm text-white/40">{videos.length} {language === "en" ? "published video(s)" : "vídeo(s) publicado(s)"}</span>}</div>
    {isLoading ? <div className="mt-7 h-56 animate-pulse rounded-2xl bg-white/5"/> : videos.length ? <div className="mt-7 grid gap-5 md:grid-cols-2">{videos.map(video => <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/25"><VideoPlayer src={video.url} title={video.title} language={language}/><div className="p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{video.title}</h3>{video.country && <span className="text-xs text-white/40">{video.country}</span>}</div>{video.description && <p className="mt-2 text-sm leading-6 text-white/50">{video.description}</p>}</div></article>)}</div> : <div className="mt-7 grid min-h-52 place-items-center rounded-2xl border border-dashed border-white/15 bg-black/15 px-6 text-center"><div><Video className="mx-auto text-white/30" size={28}/><p className="mt-3 max-w-sm text-sm text-white/50">{copy.empty}</p></div></div>}
  </section>;
}

export function VideoShowcase({ language }: { language: "pt" | "en" }) {
  const english = language === "en";
  const standards = english ? [
    ["Condition, in context", "Detailed images, technical notes and relevant condition details belong with each listing."],
    ["Media with purpose", "Demos are linked to the instrument so buyers can evaluate the exact gear before reaching out."],
    ["Permission first", "Customer performance videos are shown only after express authorization."],
  ] : [
    ["Condição, em contexto", "Imagens detalhadas, ficha técnica e observações relevantes acompanham cada anúncio."],
    ["Mídia com propósito", "As demonstrações são vinculadas ao instrumento para avaliar o equipamento antes de conversar."],
    ["Autorização primeiro", "Vídeos de clientes só aparecem após autorização expressa."],
  ];
  return <section id="videos" className="container scroll-mt-24 space-y-6 py-24"><VideoStrip kind="demo" language={language}/><VideoStrip kind="client" language={language}/><div className="rounded-3xl border border-white/10 bg-black/20 p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.22em] text-red-400">{english ? "Tone standard" : "Padrão Tone"}</p><div className="mt-5 grid gap-5 md:grid-cols-3">{standards.map(([title, body]) => <div key={title} className="border-l border-red-500/45 pl-4"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{body}</p></div>)}</div></div></section>;
}
