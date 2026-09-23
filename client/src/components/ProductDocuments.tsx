import React from "react";
import { ExternalLink, FileCheck2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export type ProductDocument = { id: number; title: string; documentType: "invoice" | "certificate" | "inspection" | "other"; fileName: string; mimeType: string; url: string };

const typeLabel = (type: ProductDocument["documentType"], language: "pt" | "en") => {
  const labels = language === "en"
    ? { invoice: "Invoice", certificate: "Certificate", inspection: "Inspection", other: "Document" }
    : { invoice: "Nota fiscal", certificate: "Certificado", inspection: "Inspeção", other: "Documento" };
  return labels[type];
};

export function ProductDocumentList({ documents, language }: { documents: ProductDocument[]; language: "pt" | "en" }) {
  const english = language === "en";
  return <div className="space-y-3">{documents.map(document => <article key={document.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-300"><FileText size={19}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{document.title}</p><p className="mt-1 text-xs text-white/45">{typeLabel(document.documentType, language)} · {document.fileName}</p></div><a href={document.url} target="_blank" rel="noreferrer" className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-white px-3 text-xs font-bold text-black transition hover:bg-red-500 hover:text-white"><ExternalLink size={14}/>{english ? "Open" : "Abrir"}</a></article>)}</div>;
}

export function ProductDocuments({ documents, language }: { documents: ProductDocument[]; language: "pt" | "en" }) {
  if (!documents.length) return null;
  const english = language === "en";
  return <Dialog><DialogTrigger asChild><button type="button" className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-400/15"><FileCheck2 size={16}/>{english ? `${documents.length} document${documents.length > 1 ? "s" : ""} available` : `${documents.length} documento${documents.length > 1 ? "s" : ""} disponível${documents.length > 1 ? "is" : ""}`}</button></DialogTrigger><DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-[#121214] text-white sm:max-w-xl"><DialogHeader><DialogTitle>{english ? "Product documentation" : "Documentação do produto"}</DialogTitle><DialogDescription className="text-white/50">{english ? "Review the files made available for this instrument." : "Consulte os arquivos disponibilizados para este instrumento."}</DialogDescription></DialogHeader><ProductDocumentList documents={documents} language={language}/></DialogContent></Dialog>;
}
