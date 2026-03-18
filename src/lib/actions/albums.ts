"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createActivity } from "./activities";
import { getRecommendations, getArtistId } from "@/lib/services/spotify";
import type {
  AlbumReview,
  CreateAlbumReviewInput,
  UpdateAlbumReviewInput,
  SpotifyRecommendation,
} from "@/types";

// === Créer une review d'album ===
export async function createAlbumReview(
  input: CreateAlbumReviewInput
): Promise<{ success: boolean; error?: string; data?: AlbumReview }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  if (input.rating < 1 || input.rating > 10) {
    return { success: false, error: "La note doit être entre 1 et 10" };
  }

  const { data, error } = await supabase
    .from("album_reviews")
    .insert({
      user_id: user.id,
      album_name: input.album_name,
      artist_name: input.artist_name,
      cover_url: input.cover_url || null,
      spotify_id: input.spotify_id || null,
      spotify_url: input.spotify_url || null,
      release_date: input.release_date || null,
      total_tracks: input.total_tracks || null,
      rating: input.rating,
      review: input.review || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating album review:", error);
    return { success: false, error: "Erreur lors de la création de la review" };
  }

  // Créer l'activité pour le feed
  await createActivity({
    type: "album_reviewed",
    reference_id: data.id,
    metadata: {
      album_name: input.album_name,
      artist_name: input.artist_name,
      cover_url: input.cover_url,
      rating: input.rating,
      review: input.review,
    },
  });

  revalidatePath("/albums");
  return { success: true, data: data as AlbumReview };
}

// === Récupérer les reviews de l'utilisateur ===
export async function getUserAlbumReviews(): Promise<AlbumReview[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("album_reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching album reviews:", error);
    return [];
  }

  return (data || []) as AlbumReview[];
}

// === Mettre à jour une review ===
export async function updateAlbumReview(
  reviewId: string,
  input: UpdateAlbumReviewInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  if (input.rating !== undefined && (input.rating < 1 || input.rating > 10)) {
    return { success: false, error: "La note doit être entre 1 et 10" };
  }

  const { error } = await supabase
    .from("album_reviews")
    .update(input)
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating album review:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }

  revalidatePath("/albums");
  return { success: true };
}

// === Supprimer une review ===
export async function deleteAlbumReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("album_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting album review:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }

  revalidatePath("/albums");
  return { success: true };
}

// === Récupérer des recommandations basées sur les albums écoutés (Pro/Band only) ===
export async function getAlbumRecommendations(): Promise<{
  success: boolean;
  error?: string;
  data?: SpotifyRecommendation[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Vérifier le plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    return { success: false, error: "Cette fonctionnalité nécessite un plan Pro ou Band" };
  }

  // Récupérer les artistes des albums écoutés récemment
  const { data: reviews } = await supabase
    .from("album_reviews")
    .select("artist_name, spotify_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!reviews || reviews.length === 0) {
    return { success: true, data: [] };
  }

  // Récupérer les IDs d'artistes Spotify
  const uniqueArtists = [...new Set(reviews.map((r) => r.artist_name))];
  const artistIds: string[] = [];

  for (const artistName of uniqueArtists.slice(0, 5)) {
    const id = await getArtistId(artistName);
    if (id) artistIds.push(id);
  }

  if (artistIds.length === 0) {
    return { success: true, data: [] };
  }

  // Obtenir les recommandations
  const albums = await getRecommendations(artistIds, 20);

  // Filtrer les albums déjà reviewés
  const reviewedSpotifyIds = new Set(reviews.map((r) => r.spotify_id).filter(Boolean));
  const filtered = albums.filter((a) => !reviewedSpotifyIds.has(a.id));

  return {
    success: true,
    data: filtered.map((a) => ({
      id: a.id,
      name: a.name,
      artists: a.artists,
      images: a.images,
      external_urls: a.external_urls,
      release_date: a.release_date,
      total_tracks: a.total_tracks,
    })),
  };
}
