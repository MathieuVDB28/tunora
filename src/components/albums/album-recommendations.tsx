"use client";

import { useState, useEffect } from "react";
import { getAlbumRecommendations } from "@/lib/actions/albums";
import type { SpotifyRecommendation } from "@/types";

interface AlbumRecommendationsProps {
  isPaid: boolean;
  hasReviews: boolean;
}

export function AlbumRecommendations({ isPaid, hasReviews }: AlbumRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SpotifyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isPaid && hasReviews && !loaded) {
      loadRecommendations();
    }
  }, [isPaid, hasReviews, loaded]);

  const loadRecommendations = async () => {
    setLoading(true);
    const result = await getAlbumRecommendations();
    if (result.success && result.data) {
      setRecommendations(result.data);
    }
    setLoading(false);
    setLoaded(true);
  };

  if (!isPaid) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <span className="material-symbols-outlined text-3xl">stars</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold">Fonctionnalité Pro</h3>
        <p className="mb-6 max-w-sm text-center text-muted-foreground">
          Passe en Pro pour obtenir des recommandations d&apos;albums personnalisées basées sur tes écoutes
        </p>
        <a
          href="/settings"
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-medium text-white"
        >
          Passer Pro
        </a>
      </div>
    );
  }

  if (!hasReviews) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-3xl">recommend</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold">Pas encore de recommandations</h3>
        <p className="max-w-sm text-center text-muted-foreground">
          Ajoute des albums écoutés pour recevoir des recommandations personnalisées
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement des recommandations...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && loaded) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-3xl">recommend</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold">Aucune recommandation</h3>
        <p className="mb-4 max-w-sm text-center text-muted-foreground">
          Ajoute plus d&apos;albums pour de meilleures recommandations
        </p>
        <button
          onClick={loadRecommendations}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Basé sur tes écoutes récentes
        </p>
        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Rafraîchir
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recommendations.map((album) => (
          <div
            key={album.id}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-border/80"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              {album.images[0]?.url ? (
                <img
                  src={album.images[0].url}
                  alt={album.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-muted-foreground">album</span>
                </div>
              )}

              {album.external_urls?.spotify && (
                <a
                  href={album.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1DB954] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Écouter sur Spotify"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              )}
            </div>

            <div className="p-3">
              <h3 className="truncate font-semibold">{album.name}</h3>
              <p className="truncate text-sm text-muted-foreground">
                {album.artists.map((a) => a.name).join(", ")}
              </p>
              {album.release_date && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {album.release_date.split("-")[0]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
