"use client";

import { useState, useOptimistic, useTransition } from "react";
import { toggleReaction } from "@/lib/actions/activities";
import type { ReactionSummary } from "@/types";

const AVAILABLE_EMOJIS = ["🔥", "👏", "🎸", "❤️", "😍", "🤘"];

interface ActivityReactionsProps {
  activityId: string;
  reactions: ReactionSummary[];
  currentUserReactions: string[];
}

export function ActivityReactions({
  activityId,
  reactions,
  currentUserReactions,
}: ActivityReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticReactions, addOptimisticReaction] = useOptimistic(
    { reactions, currentUserReactions },
    (state, emoji: string) => {
      const reacted = state.currentUserReactions.includes(emoji);
      const newUserReactions = reacted
        ? state.currentUserReactions.filter((e) => e !== emoji)
        : [...state.currentUserReactions, emoji];

      const newReactions = [...state.reactions];
      const idx = newReactions.findIndex((r) => r.emoji === emoji);
      if (idx >= 0) {
        const updated = { ...newReactions[idx] };
        updated.count += reacted ? -1 : 1;
        updated.reacted = !reacted;
        if (updated.count <= 0) {
          newReactions.splice(idx, 1);
        } else {
          newReactions[idx] = updated;
        }
      } else {
        newReactions.push({ emoji, count: 1, reacted: true });
      }

      return { reactions: newReactions, currentUserReactions: newUserReactions };
    }
  );

  const handleReaction = (emoji: string) => {
    setShowPicker(false);
    startTransition(async () => {
      addOptimisticReaction(emoji);
      await toggleReaction(activityId, emoji);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Réactions existantes */}
      {optimisticReactions.reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleReaction(r.emoji)}
          disabled={isPending}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition-colors ${
            r.reacted
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "bg-accent/50 text-muted-foreground hover:bg-accent"
          }`}
        >
          <span>{r.emoji}</span>
          <span className="text-xs font-medium">{r.count}</span>
        </button>
      ))}

      {/* Bouton pour ajouter une réaction */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <span className="material-symbols-outlined text-[20px]">add_reaction</span>
        </button>

        {/* Picker d'emoji */}
        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-xl border border-border bg-card p-2 shadow-lg">
              {AVAILABLE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-accent ${
                    optimisticReactions.currentUserReactions.includes(emoji)
                      ? "bg-primary/15"
                      : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
