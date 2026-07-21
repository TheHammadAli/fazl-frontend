/**
 * Public site origin for share/WhatsApp links.
 * WhatsApp does not turn localhost URLs into tappable blue links,
 * so set NEXT_PUBLIC_APP_URL to your deployed frontend (e.g. Vercel).
 */
export function getPublicAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function buildListingUrl(path: string): string {
  const origin = getPublicAppOrigin();
  if (!origin) return path.startsWith("/") ? path : `/${path}`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}
