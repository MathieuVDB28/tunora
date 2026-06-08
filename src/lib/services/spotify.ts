import { unstable_cache } from 'next/cache';
import type { SpotifySearchResult, SpotifyTrack, SpotifyAlbumSearchResult, SpotifyAlbum, SpotifyAlbumDetails, SpotifyArtist, SpotifyAudioFeatures } from '@/types';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Si le token est encore valide, le réutiliser
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Spotify token error:', response.status, errorBody);
    throw new Error(`Failed to get Spotify access token (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  accessToken = data.access_token as string;
  // Expire 1 minute avant pour être sûr
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return accessToken!;
}

export async function searchTracks(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
  if (!query.trim()) {
    return [];
  }

  const token = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Spotify search error:', response.status, errorBody);

    // If 401, token is invalid - reset it so next call gets a fresh one
    if (response.status === 401) {
      accessToken = null;
      tokenExpiry = 0;
    }

    throw new Error(`Spotify search failed (${response.status}): ${errorBody}`);
  }

  const data: SpotifySearchResult = await response.json();
  return data.tracks.items;
}

export function formatTrackForSong(track: SpotifyTrack) {
  return {
    id: track.id, // ID Spotify pour l'utiliser comme clé React
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    cover_url: track.album.images[0]?.url,
    spotify_id: track.id,
    preview_url: track.preview_url,
  };
}

export async function searchAlbums(query: string, limit: number = 10): Promise<SpotifyAlbum[]> {
  if (!query.trim()) {
    return [];
  }

  const token = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search Spotify albums');
  }

  const data: SpotifyAlbumSearchResult = await response.json();
  return data.albums.items;
}

export function formatAlbumForFavorite(album: SpotifyAlbum) {
  return {
    id: album.id,
    name: album.name,
    artists: album.artists,
    images: album.images,
  };
}

// Key names for conversion (Pitch Class Notation)
export const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const MODE_NAMES = ['Minor', 'Major'] as const;

export function formatKeyName(key: number, mode: number): string {
  if (key < 0 || key > 11) return 'Unknown';
  return `${KEY_NAMES[key]} ${MODE_NAMES[mode] || 'Minor'}`;
}

function getServiceRoleSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role credentials not configured');
  return createServiceRoleClient(url, key);
}

export async function getUserSpotifyToken(userId: string): Promise<string | null> {
  const supabase = getServiceRoleSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
    .eq('id', userId)
    .single();

  if (error || !data?.spotify_access_token) return null;

  // Check if token is expired
  const expiresAt = new Date(data.spotify_token_expires_at).getTime();
  if (Date.now() < expiresAt - 60000) {
    return data.spotify_access_token;
  }

  // Refresh the token
  if (!data.spotify_refresh_token) return null;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: data.spotify_refresh_token,
    }),
  });

  if (!response.ok) return null;

  const tokenData = await response.json();
  const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  await supabase
    .from('profiles')
    .update({
      spotify_access_token: tokenData.access_token,
      spotify_token_expires_at: newExpiresAt,
      ...(tokenData.refresh_token ? { spotify_refresh_token: tokenData.refresh_token } : {}),
    })
    .eq('id', userId);

  return tokenData.access_token;
}

export async function getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures | null> {
  const token = await getAccessToken();

  const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return response.json();
}

// Get Spotify artist IDs from an album's spotify_id (more reliable than text search)
export async function getAlbumArtistIds(albumSpotifyId: string): Promise<string[]> {
  const token = await getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1/albums/${albumSpotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.artists || []).map((a: { id: string }) => a.id);
}

// Fetch albums from a list of Spotify artist IDs.
// Artist discovery (via Last.fm) is handled upstream in getAlbumRecommendations.
export async function getRecommendations(
  artistIds: string[],
  limit: number = 20
): Promise<SpotifyAlbum[]> {
  if (artistIds.length === 0) return [];

  const token = await getAccessToken();
  const albumMap = new Map<string, SpotifyAlbum>();

  for (const artistId of artistIds) {
    if (albumMap.size >= limit) break;
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?album_group=album&limit=3&market=FR`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) continue;
    const data = await res.json();
    for (const album of (data.items || []) as SpotifyAlbum[]) {
      if (!albumMap.has(album.id)) {
        albumMap.set(album.id, {
          id: album.id,
          name: album.name,
          artists: album.artists,
          images: album.images || [],
          external_urls: album.external_urls || {},
          release_date: album.release_date || '',
          total_tracks: album.total_tracks || 0,
        });
      }
    }
  }

  return [...albumMap.values()].slice(0, limit);
}

export async function getArtistId(artistName: string): Promise<string | null> {
  const token = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data.artists?.items?.[0]?.id || null;
}


export const getArtistDetails = unstable_cache(
  async (artistId: string): Promise<SpotifyArtist | null> => {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    return response.json();
  },
  ['spotify-artist-details'],
  { revalidate: 86400 }
);

// Uses search endpoint (limit=3, paginated) — avoids the rate-limited /artists/{id}/albums endpoint.
export async function getArtistAlbums(artistId: string, artistName: string): Promise<SpotifyAlbum[]> {
  const token = await getAccessToken();
  const allAlbums = new Map<string, SpotifyAlbum>();

  let offset = 0;
  let total = -1;

  while (allAlbums.size < 30) {
    const q = encodeURIComponent(artistName);
    const url = `https://api.spotify.com/v1/search?q=${q}&type=album&limit=3&offset=${offset}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const retryAfter = res.headers.get('Retry-After');
      console.error(`[getArtistAlbums] search status=${res.status} Retry-After=${retryAfter} body=${await res.text()}`);
      break;
    }
    const data = await res.json();
    if (total === -1) total = data.albums?.total ?? 0;
    const items = (data.albums?.items || []) as SpotifyAlbum[];

    // Keep only albums where this artist is a primary artist
    for (const item of items) {
      if (item.artists.some((a) => a.id === artistId || a.name.toLowerCase() === artistName.toLowerCase())) {
        allAlbums.set(item.id, item);
      }
    }

    offset += 3;
    if (offset >= total || items.length === 0) break;
  }

  // Deduplicate by normalized name — Spotify returns multiple editions of the same album
  const seenNames = new Set<string>();
  const deduped: SpotifyAlbum[] = [];
  for (const album of allAlbums.values()) {
    const key = album.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    if (!seenNames.has(key)) {
      seenNames.add(key);
      deduped.push(album);
    }
  }

  deduped.sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''));

  console.log(`[getArtistAlbums] collected=${allAlbums.size} deduped=${deduped.length} for "${artistName}"`);
  return deduped;
}

export const getAlbumDetails = unstable_cache(
  async (albumId: string): Promise<SpotifyAlbumDetails | null> => {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    return response.json();
  },
  ['spotify-album-details'],
  { revalidate: 86400 }
);

export async function searchArtists(query: string, limit: number = 5): Promise<SpotifyArtist[]> {
  if (!query.trim()) return [];
  const token = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return (data.artists?.items || []) as SpotifyArtist[];
}

export async function getAudioFeaturesBatch(trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
  if (trackIds.length === 0) return [];

  const token = await getAccessToken();
  const ids = trackIds.slice(0, 100).join(',');

  const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.audio_features || []).filter(Boolean);
}
