export type ToneAnalyticsEventType = "page_view" | "product_view" | "cart_add" | "cart_checkout" | "whatsapp_contact" | "international_inquiry" | "custom_inquiry";

export type ToneAnalyticsPayload = {
  eventType: ToneAnalyticsEventType;
  page?: string;
  productId?: number;
  source?: string;
};

export const TONE_ANALYTICS_EVENT = "tone-analytics-event";

function getOrCreateId(key: string, prefix: string) {
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const id = `${prefix}-${random}`.slice(0, 96);
  window.localStorage.setItem(key, id);
  return id;
}

export function getToneAnalyticsIdentity() {
  if (typeof window === "undefined") return { visitorId: "server-render", sessionId: "server-render" };
  try {
    return {
      visitorId: getOrCreateId("tone-visitor-id", "visitor"),
      sessionId: getOrCreateId("tone-session-id", "session"),
    };
  } catch {
    const fallback = `anonymous-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return { visitorId: fallback, sessionId: fallback };
  }
}

export function trackToneEvent(payload: ToneAnalyticsPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToneAnalyticsPayload>(TONE_ANALYTICS_EVENT, { detail: payload }));
}
