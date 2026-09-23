import React, { useState } from "react";
import { FileText, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
type DocumentType = "invoice" | "certificate" | "inspection" | "other";
type ManagedDocument = { id: number; productId: number; title: string; documentType: DocumentType; fileName: string; mimeType: typeof allowedTypes[number]; storageKey: string; url: string; published: number; sortOrder: number };
type UploadFile = Pick<File, "name" | "type" | "size"> & Blob;
type PrepareUpload = { mutateAsync: (input: { filename: string; contentType: typeof allowedTypes[number] }) => Promise<{ uploadUrl: string; key: string; url: string }> };

export async function uploadProductDocument(file: UploadFile, prepareUpload: PrepareUpload) {
  const prepared = await prepareUpload.mutateAsync({ filename: file.name, contentType: file.type as typeof allowedTypes[number] });
  const upload = await fetch(prepared.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!upload.ok) throw new Error("Não foi possível enviar o documento.");
  return { storageKey: prepared.key, url: prepared.url, fileName: file.name, mimeType: file.type as typeof allowedTypes[number] };
}

export function ProductDocumentManager({ productId }: { productId: number }) {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("invoice");
  const [sortOrder, setSortOrder] = useState("0");
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [editingDocument, setEditingDocument] = useState<ManagedDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const documentsQuery = trpc.documents.listAdmin.useQuery({ productId });
  const prepareUpload = trpc.documents.prepareUpload.useMutation();
  const create = trpc.documents.create.useMutation();
  const update = trpc.documents.update.useMutation();
  const remove = trpc.documents.remove.useMutation({ onSuccess: () => documentsQuery.refetch() });

  const reset = () => { setTitle(""); setDocumentType("invoice"); setSortOrder("0"); setPublished(true); setFile(null); setEditingDocument(null); };
  const edit = (document: ManagedDocument) => { setEditingDocument(document); setTitle(document.title); setDocumentType(document.documentType); setSortOrder(String(document.sortOrder)); setPublished(!!document.published); setFile(null); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file && !editingDocument) return toast.error("Selecione um arquivo de documento.");
    if (file && !allowedTypes.includes(file.type as typeof allowedTypes[number])) return toast.error("Envie PDF, JPG, PNG ou WEBP.");
    if (file && file.size > 15 * 1024 * 1024) return toast.error("O documento deve ter no máximo 15 MB.");
    setSubmitting(true);
    try {
      let storageKey = editingDocument?.storageKey || "";
      let url = editingDocument?.url || "";
      let fileName = editingDocument?.fileName || "";
      let mimeType = editingDocument?.mimeType || "application/pdf";
      if (file) {
        const uploaded = await uploadProductDocument(file, prepareUpload);
        storageKey = uploaded.storageKey; url = uploaded.url; fileName = uploaded.fileName; mimeType = uploaded.mimeType;
      }
      const payload = { productId, title: title.trim() || fileName.replace(/\.[^.]+$/, ""), documentType, fileName, mimeType, storageKey, url, published, sortOrder: Number(sortOrder) || 0 };
      if (editingDocument) await update.mutateAsync({ ...payload, id: editingDocument.id }); else await create.mutateAsync(payload);
      toast.success(editingDocument ? "Documento atualizado." : "Documento cadastrado.");
      reset(); documentsQuery.refetch();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao salvar o documento."); } finally { setSubmitting(false); }
  };

  return <section className="border-t border-white/10 pt-6"><div><p className="text-sm font-bold">Documentação do produto</p><p className="mt-1 text-xs leading-5 text-white/40">Envie nota fiscal, certificado, relatório de inspeção ou outro arquivo de até 15 MB. Os itens publicados aparecem no selo público do produto.</p></div><form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">{editingDocument ? "Editar documento" : "Novo documento"}</p>{editingDocument && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs text-white/45 hover:text-white"><X size={14}/> Cancelar edição</button>}</div><div className="grid gap-4 sm:grid-cols-2"><div><Label>Título do documento</Label><Input value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex.: Nota fiscal original" className="mt-2 border-white/10 bg-black/20 text-white placeholder:text-white/25"/></div><div><Label>Tipo</Label><select value={documentType} onChange={event => setDocumentType(event.target.value as DocumentType)} className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"><option value="invoice">Nota fiscal</option><option value="certificate">Certificado</option><option value="inspection">Inspeção</option><option value="other">Outro documento</option></select></div></div><div className="grid gap-4 sm:grid-cols-[1fr_110px]"><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm text-white/60 transition hover:border-red-500/60"><Upload className="text-red-400" size={18}/><span className="truncate">{file ? file.name : editingDocument ? "Substituir arquivo (opcional)" : "Selecionar PDF ou imagem"}</span><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={event => setFile(event.target.files?.[0] || null)}/></label><div><Label>Ordem</Label><Input value={sortOrder} onChange={event => setSortOrder(event.target.value)} inputMode="numeric" className="mt-2 border-white/10 bg-black/20 text-white"/></div></div><label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={published} onChange={event => setPublished(event.target.checked)} className="h-4 w-4 accent-red-600"/> Publicar no produto</label><Button disabled={submitting} type="submit" className="w-full bg-red-600 hover:bg-red-500">{editingDocument ? <Pencil size={17}/> : <Plus size={17}/>} {submitting ? "Enviando..." : editingDocument ? "Salvar documento" : "Adicionar documento"}</Button></form><div className="mt-4 space-y-2">{(documentsQuery.data as ManagedDocument[] | undefined)?.map(document => <div key={document.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3"><FileText size={18} className="shrink-0 text-red-300"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{document.title}</p><p className="mt-0.5 text-xs text-white/40">{document.published ? "Publicado" : "Rascunho"} · {document.fileName}</p></div><a href={document.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-white/50 hover:text-white">Abrir</a><button type="button" onClick={() => edit(document)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="Editar documento"><Pencil size={16}/></button><button type="button" onClick={() => { if (confirm("Remover este documento?")) remove.mutate({ id: document.id }); }} className="rounded-lg p-2 text-white/45 hover:bg-red-500/15 hover:text-red-300" aria-label="Remover documento"><Trash2 size={16}/></button></div>)}{!documentsQuery.data?.length && <p className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/35">Nenhum documento cadastrado para este produto.</p>}</div></section>;
}
