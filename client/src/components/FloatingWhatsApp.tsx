import React, { useState } from "react";
import { ChevronDown, Globe2, MessageCircle, Repeat2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const WHATSAPP_NUMBER = "5565993074442";

export function getWhatsAppTopicUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppTopics(language: "pt" | "en"): Array<{ title: string; message: string; Icon: LucideIcon }> {
  return language === "en" ? [
    { title: "Shipping in Brazil & worldwide", message: "Hello! I have a question about shipping within Brazil or internationally from Tone Market.", Icon: Globe2 },
    { title: "Find an instrument", message: "Hello! I would like help finding an instrument at Tone Market.", Icon: MessageCircle },
    { title: "Trade or sell", message: "Hello! I would like to trade or sell an instrument with Tone Market.", Icon: Repeat2 },
  ] : [
    { title: "Envios no Brasil e exterior", message: "Olá! Tenho uma dúvida sobre envio dentro do Brasil ou internacional pela Tone Market.", Icon: Globe2 },
    { title: "Encontrar um instrumento", message: "Olá! Quero ajuda para encontrar um instrumento na Tone Market.", Icon: MessageCircle },
    { title: "Negociar ou vender", message: "Olá! Gostaria de negociar ou vender um instrumento com a Tone Market.", Icon: Repeat2 },
  ];
}

export function FloatingWhatsApp({ language }: { language: "pt" | "en" }) {
  const [open, setOpen] = useState(false);
  const english = language === "en";
  const label = english ? "Talk to Tone Market on WhatsApp" : "Falar com a Tone Market no WhatsApp";
  const topics = getWhatsAppTopics(language);

  return <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7 lg:left-7 lg:right-auto"><div className="flex flex-col items-end gap-3">{open && <div id="tone-whatsapp-topics" role="dialog" aria-label={english ? "WhatsApp contact topics" : "Assuntos para contato no WhatsApp"} className="w-64 rounded-2xl border border-white/15 bg-[#141416]/95 p-2 shadow-2xl backdrop-blur-xl"><p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-[.16em] text-white/45">{english ? "How can we help?" : "Como podemos ajudar?"}</p>{topics.map(({ title, message, Icon }) => <a key={title} href={getWhatsAppTopicUrl(message)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"><Icon size={18} className="text-[#25D366]"/>{title}</a>)}</div>}<button type="button" onClick={() => setOpen(!open)} aria-label={label} aria-expanded={open} aria-controls="tone-whatsapp-topics" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-[#25D366] px-4 text-sm font-bold text-[#071b0f] shadow-[0_12px_32px_rgba(37,211,102,.28)] transition duration-200 hover:-translate-y-1 hover:bg-[#38e878] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c] active:scale-[.97]"><MessageCircle size={22} fill="currentColor" aria-hidden="true"/><span className="hidden sm:inline">WhatsApp</span><ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} aria-hidden="true"/></button></div></div>;
}
