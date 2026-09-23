export const WHATSAPP_NUMBER = "5565993074442";

export function formatPrice(cents: number | null) {
  return cents == null ? "Consulte no WhatsApp" : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00a0/g, " ");
}

export function buildPurchaseMessage(input: { customerName: string; productName: string; priceCents: number | null; condition: "new" | "used"; available: boolean; productUrl: string; language?: "pt" | "en"; usdRate?: number | null; country?: string; city?: string }) {
  const english = input.language === "en";
  const usdPrice = input.priceCents !== null && input.usdRate ? ((input.priceCents / 100) * input.usdRate).toLocaleString("en-US", { style: "currency", currency: "USD" }) : null;
  const destination = input.country?.trim() ? (english ? `\nDestination: ${input.country.trim()}${input.city?.trim() ? `, ${input.city.trim()}` : ""}\nPlease confirm freight, insurance, import duties and documentation for this destination.` : `\nDestino: ${input.country.trim()}${input.city?.trim() ? `, ${input.city.trim()}` : ""}\nPor favor, confirmem frete, seguro, impostos de importação e documentação para este destino.`) : "";
  return english
    ? `Hello, my name is ${input.customerName.trim()}. I am interested in *${input.productName}*.\n\n${usdPrice ? `Estimated USD price: ${usdPrice}\nOriginal BRL list price: ${formatPrice(input.priceCents)}` : `Listed price: ${formatPrice(input.priceCents)}`}\nCondition: ${input.condition === "new" ? "New" : "Used"}\nAvailability: ${input.available ? "Available" : "Needs confirmation"}${destination}\n\nDirect product link: ${input.productUrl}\n\nI would like to confirm the details and payment options.`
    : `Olá, meu nome é ${input.customerName.trim()}. Tenho interesse no produto *${input.productName}*.\n\nPreço anunciado: ${formatPrice(input.priceCents)}\nEstado: ${input.condition === "new" ? "Novo" : "Usado"}\nDisponibilidade: ${input.available ? "Disponível" : "Preciso confirmar"}${destination}\n\nLink direto do produto: ${input.productUrl}\n\nGostaria de confirmar os detalhes e as formas de pagamento.`;
}

export function buildOrderRequestMessage(input: { customerName: string; productName: string; productUrl: string; language?: "pt" | "en"; country?: string; city?: string }) {
  const english = input.language === "en";
  const destination = input.country?.trim() ? (english ? `\nDestination: ${input.country.trim()}${input.city?.trim() ? `, ${input.city.trim()}` : ""}` : `\nDestino: ${input.country.trim()}${input.city?.trim() ? `, ${input.city.trim()}` : ""}`) : "";
  return english
    ? `Hello, my name is ${input.customerName.trim()}. I saw that *${input.productName}* has already been sold by Tone Market.${destination}\n\nI am interested in placing a custom order for a similar instrument. Could you let me know about availability, specifications, estimated time and international shipping?\n\nReference product link: ${input.productUrl}`
    : `Olá, meu nome é ${input.customerName.trim()}. Vi que o produto *${input.productName}* já foi vendido pela Tone Market.${destination}\n\nTenho interesse de fazer uma encomenda de um instrumento parecido. Podem me informar disponibilidade, especificações, prazo estimado e opções de envio?\n\nLink do produto de referência: ${input.productUrl}`;
}

export function buildCartMessage(input: { customerName: string; items: Array<{ name: string; priceCents: number | null; condition: "new" | "used"; available: boolean; slug: string }>; language?: "pt" | "en" }) {
  const english = input.language === "en";
  const base = typeof window === "undefined" ? "https://tonemarketing.example" : window.location.origin;
  const listing = input.items.map((item, index) => `${index + 1}. *${item.name}*\n${english ? "Listed price" : "Preço anunciado"}: ${formatPrice(item.priceCents)}\n${english ? "Condition" : "Estado"}: ${item.condition === "new" ? (english ? "New" : "Novo") : (english ? "Used" : "Usado")}\n${english ? "Availability" : "Disponibilidade"}: ${item.available ? (english ? "Available" : "Disponível") : (english ? "Confirm with Tone" : "Confirmar com a Tone")}\nLink: ${base}/produto/${item.slug}`).join("\n\n");
  return english ? `Hello, my name is ${input.customerName.trim()}. I selected ${input.items.length} instrument${input.items.length > 1 ? "s" : ""} in the Tone cart:\n\n${listing}\n\nI would like to confirm availability, freight and payment options for this selection.` : `Olá, meu nome é ${input.customerName.trim()}. Selecionei ${input.items.length} instrumento${input.items.length > 1 ? "s" : ""} no carrinho da Tone:\n\n${listing}\n\nGostaria de confirmar disponibilidade, frete e formas de pagamento para esta seleção.`;
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
