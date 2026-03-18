"use client";

import { useState } from "react";
import type { AlbumReview, UserPlan } from "@/types";
import { AlbumReviewCard } from "./album-review-card";
import { AddAlbumModal } from "./add-album-modal";
import { AlbumRecommendations } from "./album-recommendations";

interface AlbumsViewProps {
  initialReviews: AlbumReview[];
  userPlan: UserPlan;
}

export function AlbumsView({ initialReviews, userPlan }: AlbumsViewProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reviews" | "recommendations">("reviews");
  const isPaid = userPlan !== "free";

  const handleReviewAdded = (review: AlbumReview) => {
    setReviews((prev) => [review, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Albums</h1>
          <p className="mt-1 text-muted-foreground">
            Tes ecoutes et impressions
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Ajouter
        </button>
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
          Mes ecoutes ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "recommendations"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recommandations
          {!isPaid && (
            <span className="ml-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-500">PRO</span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "reviews" && (
        <>
          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <AlbumReviewCard
                  key={review.id}
                  review={review}
                  onDeleted={handleReviewDeleted}
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
                Ajoute les albums que tu as ecoutes, note-les et partage ton avis
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

      {activeTab === "recommendations" && (
        <AlbumRecommendations isPaid={isPaid} hasReviews={reviews.length > 0} />
      )}

      {/* Add Album Modal */}
      <AddAlbumModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={handleReviewAdded}
      />
    </div>
  );
}
