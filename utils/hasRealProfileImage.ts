const DEFAULT_AVATAR_SENTINEL = "default-avatar.png";

/**
 * The backend seeds new users with the literal string "default-avatar.png" —
 * not a real hosted image — as a "no photo set yet" placeholder. Callers must
 * treat that the same as no image at all, or the fallback avatar never shows.
 */
export function hasRealProfileImage(image?: string | null): boolean {
  return Boolean(image) && !image!.includes(DEFAULT_AVATAR_SENTINEL);
}
