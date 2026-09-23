import React, { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Check, MessageCircle, PlayCircle, Share2, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildOrderRequestMessage, buildPurchaseMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { LanguageToggle, useLanguage } from "@/lib/i18n";
import { formatBrl, formatProductPrice, formatUsdRate } from "@/lib/currency";
import { InternationalBuyerGuide } from "@/components/InternationalBuyerGuide";
import { ProductDocuments } from "@/components/ProductDocuments";
import { VideoPlayer } from "@/components/VideoPlayer";
import { toneContextForCategory, useAmbientAudio } from "@/components/AmbientAudio";
import { useCart } from "@/components/Cart";
import { DEFAULT_PRODUCT_IMAGE_ASPECT, getProductImageAspect } from "@/lib/productImageAspect";
import { trackToneEvent } from "@/lib/analytics";

const fallbacks = [
  "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1200&q=85",
];

export default function Product() {
  const { t, language } = useLanguage();
  const [, params] = useRoute("/produto/:slug");
  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug: params?.slug ?? "" });
  const { data: fxQuote, isLoading: isFxLoading } = trpc.currency.usdQuote.useQuery();
  const [active, setActive] = useState(0);
  const [imageAspects, setImageAspects] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [destination, setDestination] = useState({ country: "", city: "" });
  const { setToneContext } = useAmbientAudio();
  const { addItem } = useCart();

  useEffect(() => { if (product?.category) setToneContext(toneContextForCategory(product.category)); }, [product?.category, setToneContext]);
  useEffect(() => { if (product?.id) trackToneEvent({ eventType: "product_view", productId: product.id, source: "product_detail" }); }, [product?.id]);

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-[#0b0b0c] text-white/50">{t("Carregando instrumento...")}</div>;
  if (!product) return <div className="grid min-h-screen place-items-center bg-[#0b0b0c] px-6 text-center text-white"><div><p className="text-5xl font-black">404</p><p className="mt-3 text-white/50">{t("Instrumento não encontrado.")}</p><Link href="/"><Button className="mt-6 bg-red-600">{t("Voltar para a loja")}</Button></Link></div></div>;

  const imageUrls = product.images.length ? product.images.map(image => image.url) : fallbacks;
  const activeImageAspect = imageAspects[imageUrls[active]] ?? DEFAULT_PRODUCT_IMAGE_ASPECT;
  const rememberImageAspect = (url: string, image: HTMLImageElement) => {
    const aspect = getProductImageAspect(image.naturalWidth, image.naturalHeight);
    setImageAspects(current => current[url] === aspect ? current : { ...current, [url]: aspect });
  };
  const pageUrl = typeof window === "undefined" ? "https://tonemarketing.example/produto" : window.location.href;
  const buy = () => {
    const name = customerName.trim();
    if (!name) return;
    const message = buildPurchaseMessage({ customerName: name, productName: product.name, priceCents: product.priceCents, condition: product.condition, available: !!product.available, productUrl: pageUrl, language, usdRate: fxQuote?.rate, country: destination.country, city: destination.city });
    trackToneEvent({ eventType: "whatsapp_contact", productId: product.id, source: "product_purchase" });
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  };
  const requestOrder = () => {
    const name = customerName.trim();
    if (!name) return;
    const message = buildOrderRequestMessage({ customerName: name, productName: product.name, productUrl: pageUrl, language, country: destination.country, city: destination.city });
    trackToneEvent({ eventType: "custom_inquiry", productId: product.id, source: "sold_product_order" });
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  };
  const addToCart = () => {
    addItem({ id: product.id, slug: product.slug, name: product.name, category: product.category, priceCents: product.priceCents, condition: product.condition, available: !!product.available, imageUrl: imageUrls[0] });
    trackToneEvent({ eventType: "cart_add", productId: product.id, source: "product_detail" });
  };

  return <div className="min-h-screen bg-[#0b0b0c] text-white">
    <header className="border-b border-white/10"><div className="container flex h-16 items-center justify-between gap-2 sm:h-20 sm:gap-4"><Link href="/" className="flex min-w-0 items-center gap-2 text-xs text-white/60 hover:text-white sm:gap-3 sm:text-sm"><ArrowLeft size={16} className="shrink-0 sm:h-[18px] sm:w-[18px]"/><span className="max-w-[6.5rem] leading-4 sm:max-w-none sm:leading-normal">{t("Voltar para o catálogo")}</span></Link><div className="flex shrink-0 items-center gap-2 sm:gap-3"><LanguageToggle/><img src="/manus-storage/tone-market-logo_77240e37.jpg" alt="Tone Market" className="h-7 w-9 rounded-md object-cover sm:h-10 sm:w-14 sm:rounded-lg"/></div><button onClick={() => navigator.clipboard?.writeText(pageUrl)} aria-label={t("Compartilhar")} className="flex shrink-0 items-center gap-2 text-xs text-white/50 hover:text-white sm:text-sm"><Share2 size={16}/><span className="hidden md:inline">{t("Compartilhar")}</span></button></div></header>
    <main className="container py-12 lg:py-20"><div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
      <div><div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-[#101012] transition-[aspect-ratio] duration-300" style={{ aspectRatio: activeImageAspect }}><img src={imageUrls[active]} alt={product.name} onLoad={event => rememberImageAspect(imageUrls[active], event.currentTarget)} className="h-full w-full object-contain"/></div><div className="mt-4 grid grid-cols-4 gap-3">{imageUrls.map((url, index) => <button key={`${url}-${index}`} onClick={() => setActive(index)} className={`aspect-square overflow-hidden rounded-xl border bg-[#101012] ${active === index ? "border-red-500" : "border-white/10"}`}><img src={url} alt={`${product.name} ${index + 1}`} onLoad={event => rememberImageAspect(url, event.currentTarget)} className="h-full w-full object-contain p-1"/></button>)}</div></div>
      <div className="lg:pt-8"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-300">{t(product.category)}</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/55">{product.condition === "new" ? t("Novo") : t("Usado")}</span>{product.sold ? <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-200">{language === "en" ? "Sold" : "Vendido"}</span> : null}</div><h1 className="mt-5 text-4xl font-black tracking-[-.04em] sm:text-6xl">{product.name}</h1>{product.sold ? <div className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-400/[.06] p-4"><p className="text-sm font-bold text-violet-100">{language === "en" ? "This instrument has already passed through Tone Market." : "Este instrumento já passou pela Tone Market."}</p><p className="mt-1 text-sm leading-6 text-violet-100/60">{language === "en" ? "Its photos and technical history remain available as a reference for a custom order." : "As fotos e o histórico técnico continuam disponíveis como referência para uma encomenda."}</p></div> : <><p className="mt-5 text-2xl font-bold text-white/80">{formatProductPrice(product.priceCents, language, fxQuote?.rate, t("Consulte no WhatsApp"), isFxLoading ? "USD estimate loading…" : "USD estimate unavailable")}</p>{language === "en" && product.priceCents !== null && <p className="mt-2 text-xs text-white/40">{fxQuote?.rate ? `Estimated from ${formatBrl(product.priceCents)} · ${formatUsdRate(fxQuote.rate)} · ${fxQuote.source}` : isFxLoading ? "USD estimate is loading." : "USD estimate unavailable. Confirm the final price on WhatsApp."}</p>}</>}<div className="my-8 h-px bg-white/10"/><div className="whitespace-pre-wrap text-base leading-8 text-white/55">{product.description}</div>
        {product.specifications && <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">{language === "en" ? "Technical notes" : "Ficha técnica"}</p><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/65">{product.specifications}</div></section>}
        <ProductDocuments documents={product.documents || []} language={language}/>
        <InternationalBuyerGuide language={language} productName={product.name}/>
        {product.videos?.length > 0 && <section className="mt-8"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-red-300"><PlayCircle size={15}/>{language === "en" ? "Instrument videos" : "Vídeos do instrumento"}</p><div className="mt-3 grid gap-4">{product.videos.map(video => <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black"><VideoPlayer src={video.url} title={video.title} language={language}/><div className="p-3"><p className="text-sm font-semibold">{video.title}</p>{video.description && <p className="mt-1 text-xs leading-5 text-white/45">{video.description}</p>}</div></article>)}</div></section>}
        <div className="mt-8 space-y-3 text-sm text-white/65"><div className="flex items-center gap-3"><Check size={17} className="text-red-400"/>{t("Produto verificado pela Tone Marketing")}</div><div className="flex items-center gap-3"><Check size={17} className="text-red-400"/>{language === "en" ? "Worldwide shipping is quoted individually via WhatsApp." : "Envio internacional, pagamento e documentação são combinados pelo WhatsApp."}</div></div>
        <div className={`mt-9 rounded-2xl border p-4 ${product.sold ? "border-violet-300/20 bg-violet-400/[.045]" : "border-white/10 bg-white/[.045]"}`}>{!product.sold && <><Button onClick={addToCart} disabled={!product.available} variant="outline" className="h-12 w-full border-red-400/35 text-white hover:bg-red-500/10"><ShoppingBag size={18}/>{language === "en" ? "Add to interest cart" : "Adicionar ao carrinho de interesse"}</Button><p className="mt-2 text-center text-xs text-white/35">{language === "en" ? "Add more instruments and negotiate everything in one conversation." : "Adicione mais instrumentos e negocie tudo em uma única conversa."}</p><div className="my-5 h-px bg-white/10"/></>}<label htmlFor="customer-name" className="text-sm font-semibold text-white/75">{product.sold ? (language === "en" ? "What is your name so we can discuss an order?" : "Qual é o seu nome para conversarmos sobre a encomenda?") : t("Antes de falar com a Tone, qual é o seu nome?")}</label><Input id="customer-name" value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder={t("Digite seu nome")} className="mt-3 h-11 border-white/10 bg-black/20 text-white placeholder:text-white/30"/><div className="mt-3 grid gap-3 sm:grid-cols-2"><Input value={destination.country} onChange={event => setDestination({ ...destination, country: event.target.value })} placeholder={language === "en" ? "Country for shipping quote (optional)" : "País para cotação de frete (opcional)"} className="h-11 border-white/10 bg-black/20 text-white placeholder:text-white/30"/><Input value={destination.city} onChange={event => setDestination({ ...destination, city: event.target.value })} placeholder={language === "en" ? "City (optional)" : "Cidade (opcional)"} className="h-11 border-white/10 bg-black/20 text-white placeholder:text-white/30"/></div><Button onClick={product.sold ? requestOrder : buy} disabled={product.sold ? !customerName.trim() : !product.available || !customerName.trim()} className={`mt-3 h-14 w-full rounded-xl text-base font-bold ${product.sold ? "bg-violet-500 hover:bg-violet-400" : "bg-red-600 hover:bg-red-500"}`}><MessageCircle size={19}/>{product.sold ? (language === "en" ? "I want to place a custom order" : "Tenho interesse de fazer uma encomenda") : product.available ? (language === "en" ? "Request via WhatsApp" : "Pedir pelo WhatsApp") : t("Indisponível")}</Button><p className="mt-3 text-center text-xs text-white/35">{product.sold ? (language === "en" ? "We will use this instrument as a reference and confirm possibilities directly on WhatsApp." : "Usaremos este instrumento como referência e confirmaremos as possibilidades diretamente pelo WhatsApp.") : language === "en" ? "We will confirm freight, insurance, import duties, documentation and payment directly on WhatsApp." : "Frete, seguro, impostos, documentação e pagamento serão confirmados diretamente pelo WhatsApp."}</p></div>
      </div>
    </div></main>
  </div>;
}
