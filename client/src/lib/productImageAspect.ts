export const DEFAULT_PRODUCT_IMAGE_ASPECT = 4 / 3;

export function getProductImageAspect(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return DEFAULT_PRODUCT_IMAGE_ASPECT;
  return width / height;
}
