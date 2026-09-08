export function getSocialEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('tiktok.com')) {
      const match = parsed.pathname.match(/\/video\/(\d+)/);
      return match ? `https://www.tiktok.com/player/v1/${match[1]}?autoplay=0&loop=0` : null;
    }
    if (parsed.hostname.includes('instagram.com')) {
      const match = parsed.pathname.match(/\/(p|reel|tv)\/([^/]+)/);
      return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
