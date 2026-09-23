import React from "react";
import { Link } from "wouter";
import { Globe2, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5565993074442";

export function InternationalBuyerGuide({ language, productName }: { language: "pt" | "en"; productName: string }) {
  const english = language === "en";
  const message = english
    ? `Hello! I would like a pickup or shipping quote within Brazil or internationally for ${productName}.`
    : `Olá! Gostaria de uma cotação de retirada ou envio dentro do Brasil ou internacional para ${productName}.`;
  return <section className="mt-8 rounded-2xl border border-red-500/25 bg-red-500/[.045] p-5"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-red-300"><Globe2 size={15}/>{english ? "Brazil & worldwide service" : "Atendimento no Brasil e exterior"}</p><h2 className="mt-3 text-xl font-bold">{english ? "A clear path before the conversation." : "Um caminho claro antes da conversa."}</h2><p className="mt-2 text-sm leading-6 text-white/55">{english ? "Arrange pickup or shipping within Brazil, review the inspection standard, or request an international quote for this instrument." : "Combine retirada ou envio dentro do Brasil, revise o padrão de inspeção ou peça uma cotação internacional para este instrumento."}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><Link href="/envio-internacional" className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-semibold text-white/75 transition hover:border-red-400 hover:text-white"><Globe2 className="mb-2 text-red-400" size={18}/>{english ? "Shipping guide" : "Guia de envio"}</Link><Link href="/confianca" className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-semibold text-white/75 transition hover:border-red-400 hover:text-white"><ShieldCheck className="mb-2 text-red-400" size={18}/>{english ? "Inspection standard" : "Padrão de inspeção"}</Link><Button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")} className="h-auto min-h-20 flex-col items-start rounded-xl bg-red-600 px-3 py-3 text-left hover:bg-red-500"><MessageCircle size={18}/><span>{english ? "Quote this instrument" : "Cotar este instrumento"}</span></Button></div></section>;
}
