/** Append a stable version query so browsers reload when the file at a URL changes. */
export function withImageCacheBust(
  url: string,
  version?: string | number | null,
) {
  if (!url || url.startsWith("blob:") || version == null || version === "") {
    return url;
  }
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(String(version))}`;
}
