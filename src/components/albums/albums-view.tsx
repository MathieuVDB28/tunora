"use client";

import { useState } from "react";
import type { AlbumReview, AlbumWishlistItem, UserPlan } from "@/types";
import { AlbumReviewCard } from "./album-review-card";
import { AddAlbumModal } from "./add-album-modal";
import { AlbumRecommendations } from "./album-recommendations";
import { AlbumWishlistCard } from "./album-wishlist-card";
import { AddToAlbumWishlistModal } from "./add-to-album-wishlist-modal";
import { removeFromAlbumWishlist } from "@/lib/actions/album-wishlist";

interface AlbumsViewProps {
  initialReviews: AlbumReview[];
  initialWishlist: AlbumWishlistItem[];
  userPlan: UserPlan;
}

export function AlbumsView({ initialReviews, initialWishlist, userPlan }: AlbumsViewProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reviews" | "wishlist" | "recommendations">("reviews");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [reviewFromWishlist, setReviewFromWishlist] = useState<AlbumWishlistItem | null>(null);
  const isPaid = userPlan !== "free";

  const handleReviewAdded = (review: AlbumReview) => {
    setReviews((prev) => [review, ...prev]);
    setIsAddModalOpen(false);

    // Si la review vient de la wishlist, retirer l'album de la wishlist
    if (reviewFromWishlist) {
      handleRemoveFromWishlist(reviewFromWishlist.id);
      setReviewFromWishlist(null);
    }
  };

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleReviewUpdated = (updated: AlbumReview) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleWishlistAdded = (album: AlbumWishlistItem) => {
    setWishlist((prev) => [album, ...prev]);
  };

  const handleRemoveFromWishlist = async (id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    const result = await removeFromAlbumWishlist(id);
    if (result.success) {
      setWishlist((prev) => prev.filter((a) => a.id !== id));
    }
    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleListenFromWishlist = (album: AlbumWishlistItem) => {
    setReviewFromWishlist(album);
    setIsAddModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Albums</h1>
          <p className="mt-1 text-muted-foreground">
            Tes écoutes et impressions
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "wishlist" ? (
            <button
              onClick={() => setIsWishlistModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Ajouter
            </button>
          ) : activeTab === "reviews" ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Ajouter
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-accent/50 p-1">
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "reviews"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Mes écoutes ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "wishlist"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          A écouter ({wishlist.length})
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "recommendations"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recos
          {!isPaid && (
            <span className="ml-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-500">PRO</span>
          )}
        </button>
      </div>

      {/* Content - Reviews */}
      {activeTab === "reviews" && (
        <>
          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <AlbumReviewCard
                  key={review.id}
                  review={review}
                  onDeleted={handleReviewDeleted}
                  onUpdated={handleReviewUpdated}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">album</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Aucun album</h3>
              <p className="mb-6 max-w-sm text-center text-muted-foreground">
                Ajoute les albums que tu as écoutés, note-les et partage ton avis
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground"
              >
                Ajouter un album
              </button>
            </div>
          )}
        </>
      )}

      {/* Content - Wishlist */}
      {activeTab === "wishlist" && (
        <>
          {wishlist.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((album) => (
                <AlbumWishlistCard
                  key={album.id}
                  album={album}
                  onListen={() => handleListenFromWishlist(album)}
                  onRemove={() => handleRemoveFromWishlist(album.id)}
                  isRemoving={removingIds.has(album.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <span className="material-symbols-outlined text-3xl">bookmark</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Aucun album en attente</h3>
              <p className="mb-6 max-w-sm text-center text-muted-foreground">
                Ajoute les albums que tu aimerais écouter pour ne pas les oublier
              </p>
              <button
                onClick={() => setIsWishlistModalOpen(true)}
                className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground"
              >
                Ajouter un album
              </button>
            </div>
          )}
        </>
      )}

      {/* Content - Recommendations */}
      {activeTab === "recommendations" && (
        <AlbumRecommendations
          isPaid={isPaid}
          hasReviews={reviews.length > 0}
          onReviewAdded={(review) => {
            setReviews((prev) => [review, ...prev]);
          }}
          onWishlistAdded={(album) => {
            setWishlist((prev) => [album, ...prev]);
          }}
        />
      )}

      {/* Add Album Review Modal */}
      <AddAlbumModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setReviewFromWishlist(null);
        }}
        onAdded={handleReviewAdded}
        prefillAlbum={reviewFromWishlist ? {
          name: reviewFromWishlist.album_name,
          artists: reviewFromWishlist.artist_name.split(", ").map((name) => ({ name })),
          images: reviewFromWishlist.cover_url ? [{ url: reviewFromWishlist.cover_url, width: 300, height: 300 }] : [],
          id: reviewFromWishlist.spotify_id || "",
          external_urls: { spotify: reviewFromWishlist.spotify_url || "" },
          release_date: reviewFromWishlist.release_date || "",
          total_tracks: reviewFromWishlist.total_tracks || 0,
        } : undefined}
      />

      {/* Add to Album Wishlist Modal */}
      <AddToAlbumWishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onSuccess={handleWishlistAdded}
      />
    </div>
  );
}
