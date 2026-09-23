export const RUBY_GALLERY_IMAGE_ASSETS = [
  {
    storageKey: "tone-test-electric-guitar-3-4-front_9e8795dc.png",
    url: "/media/tone-test-electric-guitar-3-4-front_9e8795dc.png",
    sortOrder: 1,
  },
  {
    storageKey: "tone-test-electric-guitar-back_59d8372b.png",
    url: "/media/tone-test-electric-guitar-back_59d8372b.png",
    sortOrder: 2,
  },
  {
    storageKey: "tone-test-electric-guitar-hardware-detail_c847509f.png",
    url: "/media/tone-test-electric-guitar-hardware-detail_c847509f.png",
    sortOrder: 3,
  },
  {
    storageKey: "tone-test-electric-guitar-headstock-detail_12402aca.png",
    url: "/media/tone-test-electric-guitar-headstock-detail_12402aca.png",
    sortOrder: 4,
  },
] as const;

export function getRubyGalleryAdditions(existingStorageKeys: string[], maximumImages = 8) {
  const remainingSlots = Math.max(0, maximumImages - existingStorageKeys.length);
  return RUBY_GALLERY_IMAGE_ASSETS
    .filter(image => !existingStorageKeys.includes(image.storageKey))
    .slice(0, remainingSlots);
}
