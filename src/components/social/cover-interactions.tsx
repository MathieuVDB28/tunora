"use client";

import { useEffect, useState } from "react";
import { getCoverActivityData } from "@/lib/actions/activities";
import { ActivityReactions } from "./activity-reactions";
import { ActivityComments } from "./activity-comments";
import type { ReactionSummary } from "@/types";

interface CoverInteractionsProps {
  coverId: string;
}

interface CoverActivityData {
  activityId: string;
  reactions: ReactionSummary[];
  currentUserReactions: string[];
  commentCount: number;
  currentUserId: string;
}

export function CoverInteractions({ coverId }: CoverInteractionsProps) {
  const [data, setData] = useState<CoverActivityData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCoverActivityData(coverId).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [coverId]);

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-border px-3 py-2.5">
      <ActivityReactions
        activityId={data.activityId}
        reactions={data.reactions}
        currentUserReactions={data.currentUserReactions}
      />
      <ActivityComments
        activityId={data.activityId}
        commentCount={data.commentCount}
        currentUserId={data.currentUserId}
      />
    </div>
  );
}
