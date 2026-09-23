export function isPromotionLive(active: number | boolean, endsAt: Date | null | undefined, now = new Date()) {
  return Boolean(active) && Boolean(endsAt) && (endsAt as Date).getTime() > now.getTime();
}
