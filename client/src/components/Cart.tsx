import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { buildCartMessage, buildWhatsAppUrl, formatPrice } from "@/lib/whatsapp";
import { trackToneEvent } from "@/lib/analytics";

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  category: string;
  priceCents: number | null;
  condition: "new" | "used";
  available: boolean;
  imageUrl?: string;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartState>({
  items: [], open: false, addItem: () => undefined, removeItem: () => undefined, clear: () => undefined, setOpen: () => undefined,
});
const storageKey = "tone-marketing-interest-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* Storage may be unavailable. */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(items)); } catch { /* Storage may be unavailable. */ }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems(current => current.some(existing => existing.id === item.id) ? current : [...current, item]);
    setOpen(true);
  }, []);
  const removeItem = useCallback((id: number) => setItems(current => current.filter(item => item.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ items, open, addItem, removeItem, clear, setOpen }), [items, open, addItem, removeItem, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }

export function CartDrawer() {
  const { items, open, setOpen, removeItem, clear } = useCart();
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const english = language === "en";
  const finalize = () => {
    if (!name.trim() || !items.length) return;
    trackToneEvent({ eventType: "cart_checkout", source: `cart_${items.length}_items` });
    trackToneEvent({ eventType: "whatsapp_contact", source: "cart_checkout" });
    window.open(buildWhatsAppUrl(buildCartMessage({ customerName: name, items, language })), "_blank", "noopener,noreferrer");
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label={english ? "Open interest cart" : "Abrir carrinho de interesse"} className="fixed bottom-24 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-[#161619]/95 px-4 text-sm font-bold text-white shadow-xl backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:right-7">
      <ShoppingBag size={18}/><span className="hidden sm:inline">{english ? "Cart" : "Carrinho"}</span>
      {items.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px]">{items.length}</span>}
    </button>
    {open && <div className="fixed inset-0 z-[60] flex justify-end bg-black/65 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={english ? "Interest cart" : "Carrinho de interesse"}>
      <button aria-label={english ? "Close cart" : "Fechar carrinho"} className="absolute inset-0 z-0 cursor-default" onClick={() => setOpen(false)}/>
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#101012] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-red-400">Tone cart</p><h2 className="mt-2 text-2xl font-black">{english ? "Your interests" : "Seus interesses"}</h2><p className="mt-2 text-sm leading-6 text-white/50">{english ? "Review the instruments before continuing the conversation." : "Revise os instrumentos antes de continuar a conversa."}</p></div>
          <button onClick={() => setOpen(false)} aria-label={english ? "Close cart" : "Fechar carrinho"} className="rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white"><X size={20}/></button>
        </div>
        <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
          {items.map(item => <article key={item.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3">
            {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover"/> : <div className="h-16 w-16 rounded-xl bg-white/5"/>}
            <div className="min-w-0 flex-1"><p className="truncate font-bold">{item.name}</p><p className="mt-1 text-xs text-white/45">{item.category} · {formatPrice(item.priceCents)}</p><button onClick={() => removeItem(item.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-300 hover:text-red-200"><Trash2 size={13}/>{english ? "Remove" : "Remover"}</button></div>
          </article>)}
          {!items.length && <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-white/15 p-8 text-center"><div><ShoppingBag className="mx-auto text-white/25" size={32}/><p className="mt-3 text-sm text-white/50">{english ? "Choose instruments and add them here." : "Escolha instrumentos e adicione-os aqui."}</p><Button variant="outline" onClick={() => setOpen(false)} className="mt-5 border-white/10 text-white hover:bg-white/10">{english ? "Keep choosing" : "Continuar escolhendo"}</Button></div></div>}
        </div>
        {items.length > 0 && <div className="mt-5 border-t border-white/10 pt-5">
          <label className="text-sm font-semibold text-white/75">{english ? "Your name" : "Seu nome"}</label>
          <Input value={name} onChange={event => setName(event.target.value)} placeholder={english ? "How should Tone call you?" : "Como a Tone pode te chamar?"} className="mt-2 h-11 border-white/10 bg-black/25 text-white placeholder:text-white/30"/>
          <Button disabled={!name.trim()} onClick={finalize} className="mt-3 h-12 w-full rounded-xl bg-red-600 hover:bg-red-500"><ShoppingBag size={17}/>{english ? `Start WhatsApp conversation (${items.length})` : items.length === 1 ? "Negociar 1 item no WhatsApp" : `Negociar ${items.length} itens no WhatsApp`}</Button>
          <div className="mt-3 flex justify-between text-xs"><button onClick={() => setOpen(false)} className="text-white/45 hover:text-white">{english ? "Keep choosing" : "Continuar escolhendo"}</button><button onClick={clear} className="text-red-300 hover:text-red-200">{english ? "Clear cart" : "Limpar carrinho"}</button></div>
        </div>}
      </aside>
    </div>}
  </>;
}
