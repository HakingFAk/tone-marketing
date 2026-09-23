import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Filter, ImagePlus, LogIn, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProductDocumentManager } from "@/components/ProductDocumentManager";
import { filterAdminProducts } from "@/lib/adminFilters";
import { toast } from "sonner";

const categories = ["Guitarras", "Violões", "Pedais", "Amplificadores", "Acessórios"] as const;
type ImageDraft = { name: string; dataUrl: string; type: string };
type FormState = {
  id?: number;
  name: string;
  category: typeof categories[number];
  description: string;
  specifications: string;
  price: string;
  condition: "new" | "used";
  available: boolean;
  sold: boolean;
  promotionActive: boolean;
  promotionEndsAt: string;
  images: ImageDraft[];
  existingImages: { id: number; url: string }[];
  removeImageIds: number[];
};
const empty: FormState = { name: "", category: "Guitarras", description: "", specifications: "", price: "", condition: "new", available: true, sold: false, promotionActive: false, promotionEndsAt: "", images: [], existingImages: [], removeImageIds: [] };

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<FormState>(empty);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [documentationFilter, setDocumentationFilter] = useState("all");
  const productsQuery = trpc.products.list.useQuery({ includeUnavailable: true }, { enabled: !!user && user.role === "admin" });
  const create = trpc.products.create.useMutation({
    onSuccess: () => { toast.success("Produto cadastrado. Agora edite-o para anexar documentos."); setForm(empty); productsQuery.refetch(); },
    onError: error => toast.error(error.message),
  });
  const update = trpc.products.update.useMutation({ onSuccess: () => { toast.success("Produto atualizado."); productsQuery.refetch(); }, onError: error => toast.error(error.message) });
  const remove = trpc.products.remove.useMutation({ onSuccess: () => { toast.success("Produto removido."); productsQuery.refetch(); }, onError: error => toast.error(error.message) });
  const allProducts = productsQuery.data || [];
  const filteredProducts = useMemo(() => filterAdminProducts(allProducts, { search, category: categoryFilter, availability: availabilityFilter, documentation: documentationFilter }), [allProducts, search, categoryFilter, availabilityFilter, documentationFilter]);

  useEffect(() => { if (!loading && !isAuthenticated) navigate("/admin"); }, [loading, isAuthenticated, navigate]);
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#0b0b0c] text-white/50">Verificando acesso...</div>;
  if (!isAuthenticated) return <div className="grid min-h-screen place-items-center bg-[#0b0b0c] px-6 text-center text-white"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-600"><LogIn /></div><h1 className="mt-6 text-3xl font-black">Área da Tone Marketing</h1><p className="mt-3 text-white/50">Entre com a conta proprietária autorizada para cadastrar produtos, fotos e documentos.</p><Button onClick={() => startLogin()} className="mt-7 bg-red-600">Entrar como administrador</Button></div></div>;
  if (user?.role !== "admin") return <div className="grid min-h-screen place-items-center bg-[#0b0b0c] px-6 text-center text-white"><div><h1 className="text-3xl font-black">Acesso restrito</h1><p className="mt-3 text-white/50">Sua conta ainda não possui permissão de administrador.</p><Button onClick={() => navigate("/")} className="mt-7 bg-white text-black">Voltar à loja</Button></div></div>;

  const set = (patch: Partial<FormState>) => setForm(current => ({ ...current, ...patch }));
  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const drafts = await Promise.all(Array.from(files).slice(0, 8).map(file => new Promise<ImageDraft>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result), type: file.type });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
    set({ images: [...form.images, ...drafts].slice(0, 8) });
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { name: form.name, category: form.category, description: form.description, specifications: form.specifications.trim() || null, priceCents: form.price ? Math.round(Number(form.price.replace(",", ".")) * 100) : null, condition: form.condition, available: form.available, sold: form.sold, promotionActive: form.promotionActive, promotionEndsAt: form.promotionActive && form.promotionEndsAt ? new Date(form.promotionEndsAt).toISOString() : null, images: form.images, removeImageIds: form.removeImageIds };
    if (editing && form.id) update.mutate({ ...payload, id: form.id }); else create.mutate(payload);
  };
  const edit = (product: any) => {
    setEditing(true);
    setForm({ id: product.id, name: product.name, category: product.category, description: product.description, specifications: product.specifications || "", price: product.priceCents ? String(product.priceCents / 100).replace(".", ",") : "", condition: product.condition, available: !!product.available, sold: !!product.sold, promotionActive: !!product.promotionActive, promotionEndsAt: product.promotionEndsAt ? new Date(product.promotionEndsAt).toISOString().slice(0, 16) : "", images: [], existingImages: product.images?.map((image: { id: number; url: string }) => ({ id: image.id, url: image.url })) || [], removeImageIds: [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const clearFilters = () => { setSearch(""); setCategoryFilter("all"); setAvailabilityFilter("all"); setDocumentationFilter("all"); };

  return <div className="min-h-screen bg-[#0b0b0c] text-white">
    <header className="border-b border-white/10">
      <div className="container flex min-h-20 flex-wrap items-center justify-between gap-3 py-3 sm:flex-nowrap">
        <a href="/" className="flex shrink-0 items-center gap-3">
          <img src="/manus-storage/tone-market-logo_77240e37.jpg" alt="Tone Market" className="h-9 w-12 rounded-lg object-cover sm:h-10 sm:w-14" />
          <span className="text-[10px] uppercase tracking-widest text-white/35 sm:text-xs">Admin</span>
        </a>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-white/50 xl:inline">Olá, {user?.name || "administrador"}</span>
          <Button variant="outline" onClick={() => navigate("/admin/insights")} className="h-9 border-white/10 px-3 text-xs text-white hover:bg-white/10 sm:h-10 sm:px-4 sm:text-sm">Indicadores</Button>
          <Button variant="outline" onClick={() => navigate("/admin/ambient")} className="h-9 border-white/10 px-3 text-xs text-white hover:bg-white/10 sm:h-10 sm:px-4 sm:text-sm">Sons</Button>
          <Button variant="outline" onClick={() => navigate("/admin/videos")} className="h-9 border-white/10 px-3 text-xs text-white hover:bg-white/10 sm:h-10 sm:px-4 sm:text-sm">Vídeos</Button>
          <Button variant="outline" onClick={() => navigate("/")} className="h-9 border-white/10 px-3 text-xs text-white hover:bg-white/10 sm:h-10 sm:px-4 sm:text-sm">Ver loja</Button>
        </div>
      </div>
    </header>
    <main className="container py-7 sm:py-10">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-red-400">Painel de controle</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">Gerencie seu catálogo.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">Cadastre instrumentos, fotos, ficha técnica, vídeos e documentos para compradores no Brasil e no exterior.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-8">
        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[.045] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{editing ? "Editar produto" : "Novo produto"}</h2>{editing && <button type="button" onClick={() => { setEditing(false); setForm(empty); }} className="text-sm text-white/45 hover:text-white">Cancelar</button>}</div>
          <div className="mt-6 space-y-5">
            <div><Label>Nome do produto</Label><Input required value={form.name} onChange={event => set({ name: event.target.value })} placeholder="Ex.: Fender Stratocaster Player" className="mt-2 border-white/10 bg-black/20 text-white placeholder:text-white/25" /></div>
            <div className="grid gap-5 sm:grid-cols-2"><div><Label>Categoria</Label><select value={form.category} onChange={event => set({ category: event.target.value as FormState["category"] })} className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white">{categories.map(category => <option key={category}>{category}</option>)}</select></div><div><Label>Conservação</Label><select value={form.condition} onChange={event => set({ condition: event.target.value as "new" | "used" })} className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"><option value="new">Novo</option><option value="used">Usado</option></select></div></div>
            <div><Label>Preço em reais (opcional)</Label><Input value={form.price} onChange={event => set({ price: event.target.value })} placeholder="Deixe vazio para 'Consulte no WhatsApp'" className="mt-2 border-white/10 bg-black/20 text-white placeholder:text-white/25" inputMode="decimal" /></div>
            <div><Label>Descrição</Label><Textarea required value={form.description} onChange={event => set({ description: event.target.value })} placeholder="Detalhes, estado, acessórios e observações..." className="mt-2 min-h-28 border-white/10 bg-black/20 text-white placeholder:text-white/25" /></div>
            <div><Label>Ficha técnica para compradores internacionais (opcional)</Label><Textarea value={form.specifications} onChange={event => set({ specifications: event.target.value })} placeholder={"Marca e modelo\nAno / cor / acabamento\nCaptadores, eletrônica ou componentes\nAcessórios, case e nota fiscal\nCondição detalhada e observações"} className="mt-2 min-h-32 border-white/10 bg-black/20 text-white placeholder:text-white/25" /><p className="mt-2 text-xs leading-5 text-white/35">Use linhas curtas para facilitar leitura e negociação internacional.</p></div>
            <div><Label>Fotos (até 8)</Label><label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 p-5 text-center transition hover:border-red-500/60 sm:p-6"><Upload className="text-red-400" /><span className="mt-2 text-sm text-white/60">Clique para selecionar múltiplas imagens</span><span className="mt-1 text-xs text-white/30">JPG, PNG ou WEBP</span><input type="file" accept="image/*" multiple className="hidden" onChange={event => onFiles(event.target.files)} /></label>{(form.images.length > 0 || form.existingImages.length > 0) && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{form.existingImages.map(image => <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg"><img src={image.url} alt="Foto salva" className="h-full w-full object-cover" /><button type="button" onClick={() => set({ existingImages: form.existingImages.filter(item => item.id !== image.id), removeImageIds: [...form.removeImageIds, image.id] })} className="absolute right-1 top-1 rounded-full bg-black/70 p-1" aria-label="Remover foto"><X size={13} /></button></div>)}{form.images.map((image, index) => <div key={image.dataUrl} className="relative aspect-square overflow-hidden rounded-lg"><img src={image.dataUrl} alt={image.name} className="h-full w-full object-cover" /><button type="button" onClick={() => set({ images: form.images.filter((_, itemIndex) => itemIndex !== index) })} className="absolute right-1 top-1 rounded-full bg-black/70 p-1" aria-label="Remover foto nova"><X size={13} /></button></div>)}</div>}</div>
            <div className="rounded-xl border border-violet-300/20 bg-violet-400/[.045] p-4"><label className="flex items-start gap-3 text-sm font-semibold text-violet-100"><input type="checkbox" checked={form.sold} onChange={event => set({ sold: event.target.checked, available: event.target.checked ? false : form.available, promotionActive: event.target.checked ? false : form.promotionActive, promotionEndsAt: event.target.checked ? "" : form.promotionEndsAt })} className="mt-0.5 h-4 w-4 shrink-0 accent-violet-400" /> Produto vendido</label><p className="mt-2 text-xs leading-5 text-violet-100/55">O item sai do catálogo disponível e passa a aparecer na vitrine pública de Vendidos, com descrição e opção de encomenda.</p></div>
            <label className={`flex items-start gap-3 text-sm ${form.sold ? "text-white/30" : "text-white/70"}`}><input type="checkbox" checked={form.available} disabled={form.sold} onChange={event => set({ available: event.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600 disabled:opacity-50" /> Produto disponível na loja</label>
            <div className={`rounded-xl border p-4 ${form.sold ? "border-white/10 bg-white/[.02] opacity-45" : "border-amber-400/20 bg-amber-400/[.045]"}`}><label className="flex items-start gap-3 text-sm font-semibold text-amber-100"><input type="checkbox" disabled={form.sold} checked={form.promotionActive} onChange={event => set({ promotionActive: event.target.checked, promotionEndsAt: event.target.checked ? form.promotionEndsAt : "" })} className="mt-0.5 h-4 w-4 shrink-0 accent-amber-400 disabled:opacity-50" /> Promoção por tempo limitado</label><p className="mt-2 text-xs leading-5 text-amber-100/55">O produto só aparece no filtro público enquanto a promoção estiver ativa e dentro do prazo.</p>{form.promotionActive && <div className="mt-4"><Label>Promoção válida até</Label><Input required type="datetime-local" value={form.promotionEndsAt} onChange={event => set({ promotionEndsAt: event.target.value })} className="mt-2 border-amber-400/20 bg-black/20 text-white" /></div>}</div>
            <Button disabled={create.isPending || update.isPending} type="submit" className="h-12 w-full rounded-xl bg-red-600 hover:bg-red-500">{editing ? <Pencil size={17} /> : <Plus size={17} />} {editing ? "Salvar alterações" : "Cadastrar produto"}</Button>
          </div>
          {editing && form.id && <ProductDocumentManager productId={form.id} />}
        </form>
        <section className="min-w-0">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Produtos cadastrados</h2><p className="mt-1 text-sm text-white/45">Localize um item e abra a edição para gerenciar seus documentos.</p></div><span className="w-fit shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">{filteredProducts.length} de {allProducts.length} itens</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-3 sm:p-4"><div className="relative"><Search className="absolute left-3 top-3 text-white/35" size={17} /><Input aria-label="Buscar produto administrativo" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome ou categoria..." className="h-11 border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/25" /></div><div className="mt-3 grid gap-3 sm:grid-cols-3"><select aria-label="Filtrar por categoria" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} className="h-10 min-w-0 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"><option value="all">Todas as categorias</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select><select aria-label="Filtrar por disponibilidade" value={availabilityFilter} onChange={event => setAvailabilityFilter(event.target.value)} className="h-10 min-w-0 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"><option value="all">Todos os status</option><option value="available">Disponíveis</option><option value="unavailable">Ocultos / indisponíveis</option></select><select aria-label="Filtrar por documentação" value={documentationFilter} onChange={event => setDocumentationFilter(event.target.value)} className="h-10 min-w-0 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white"><option value="all">Com ou sem documentação</option><option value="with">Com documentação</option><option value="without">Sem documentação</option></select></div>{(search || categoryFilter !== "all" || availabilityFilter !== "all" || documentationFilter !== "all") && <button type="button" onClick={clearFilters} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-300 hover:text-red-200"><Filter size={14} /> Limpar busca e filtros</button>}</div>
          <div className="mt-4 space-y-3">{filteredProducts.map(product => <article key={product.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.045] p-3 sm:gap-4 sm:p-4"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5 sm:h-14 sm:w-14">{product.images?.[0] ? <img src={product.images[0].url} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={20} className="text-white/25" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold">{product.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${product.sold ? "bg-violet-400/15 text-violet-200" : product.available ? "bg-emerald-400/10 text-emerald-300" : "bg-white/10 text-white/40"}`}>{product.sold ? "Vendido" : product.available ? "Ativo" : "Oculto"}</span>{(product.documents?.length || 0) > 0 && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-red-200">{product.documents.length} doc.</span>}</div><p className="mt-1 text-xs text-white/40">{product.category} • {product.condition === "new" ? "Novo" : "Usado"}</p></div><div className="flex shrink-0 items-center"><button type="button" onClick={() => edit(product)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label={`Editar ${product.name}`}><Pencil size={17} /></button><button type="button" onClick={() => { if (confirm("Remover este produto?")) remove.mutate({ id: product.id }); }} className="rounded-lg p-2 text-white/45 hover:bg-red-500/15 hover:text-red-300" aria-label={`Remover ${product.name}`}><Trash2 size={17} /></button></div></article>)}{!filteredProducts.length && <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/40 sm:p-12"><Search className="mx-auto text-white/25" size={28} /><p className="mt-3 font-semibold">Nenhum produto encontrado.</p><p className="mt-1 text-sm">Ajuste a busca ou limpe os filtros para ver o catálogo completo.</p><Button type="button" variant="outline" onClick={clearFilters} className="mt-5 border-white/15 text-white hover:bg-white/10">Limpar filtros</Button></div>}</div>
        </section>
      </div>
    </main>
  </div>;
}
