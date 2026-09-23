const WHATSAPP = "5565993074442";

export function buildInternationalInquiryUrl(input: { language: "pt" | "en"; name: string; country: string; city?: string; shippingPreference?: string }) {
  const message = input.language === "en"
    ? `Hello! My name is ${input.name}. I am interested in international shipping from Tone Market.\n\nCountry: ${input.country}\nCity: ${input.city || "To be confirmed"}\nPreferred shipping: ${input.shippingPreference || "Tone recommendation"}\n\nPlease confirm freight, insurance, import duties, documentation and payment options via WhatsApp.`
    : `Olá! Meu nome é ${input.name}. Tenho interesse em envio internacional pela Tone Market.\n\nPaís: ${input.country}\nCidade: ${input.city || "A confirmar"}\nPreferência de envio: ${input.shippingPreference || "Recomendação da Tone"}\n\nPor favor, confirmem frete, seguro, impostos de importação, documentação e opções de pagamento pelo WhatsApp.`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}
