const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0";

export async function getSimilarArtists(artistName: string): Promise<string[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) return [];

  const url =
    `${LASTFM_BASE}?method=artist.getSimilar` +
    `&artist=${encodeURIComponent(artistName)}` +
    `&api_key=${apiKey}` +
    `&limit=8` +
    `&format=json`;

  const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
  if (!res.ok) {
    console.error(`[lastfm] getSimilarArtists failed for "${artistName}": ${res.status}`);
    return [];
  }

  const data = await res.json();
  if (data.error) {
    console.error(`[lastfm] API error for "${artistName}": ${data.message}`);
    return [];
  }

  return ((data.similarartists?.artist || []) as Array<{ name: string }>).map((a) => a.name);
}
