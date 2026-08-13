export function getValidImageUrl(url?: string | null, fallback = "/Image/banner/placeholder.jpg"): string {
  if (!url) return fallback;
  
  // If it's a valid absolute URL, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // If it's a relative path starting with '/', return it
  if (url.startsWith("/")) {
    return url;
  }

  // If they forgot the leading slash, add it
  return `/${url}`;
}


export async function resolveMediaUrl(uuid: string): Promise<string> {
  const res = await fetch(`/api/media/${encodeURIComponent(uuid)}/access-url`);
  if (!res.ok) throw new Error('Failed to resolve media URL');
  const data = await res.json();
  return data.url;
}
