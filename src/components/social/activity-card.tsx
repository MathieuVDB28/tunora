"use client";

import type { ActivityWithDetails } from "@/types";

interface ActivityCardProps {
  activity: ActivityWithDetails;
}

const activityMessages: Record<string, string> = {
  song_added: "a ajout\u00e9 un nouveau morceau",
  song_mastered: "a ma\u00eetris\u00e9 un morceau",
  cover_posted: "a post\u00e9 une cover",
  friend_added: "a un nouvel ami",
  song_wishlisted: "veut apprendre",
  setlist_created: "a cr\u00e9\u00e9 une setlist",
  band_created: "a cr\u00e9\u00e9 un groupe",
  band_joined: "a rejoint un groupe",
  challenge_created: "a lanc\u00e9 un d\u00e9fi",
  challenge_accepted: "a accept\u00e9 un d\u00e9fi",
  challenge_completed: "a termin\u00e9 un d\u00e9fi",
  challenge_won: "a remport\u00e9 un d\u00e9fi !",
};

const activityIcons: Record<string, string> = {
  song_added: "add_circle",
  song_mastered: "check_circle",
  cover_posted: "videocam",
  friend_added: "person_add",
  song_wishlisted: "star",
  setlist_created: "playlist_add",
  band_created: "groups",
  band_joined: "groups",
  challenge_created: "emoji_events",
  challenge_accepted: "emoji_events",
  challenge_completed: "emoji_events",
  challenge_won: "emoji_events",
};

function ActivityIcon({ type }: { type: string }) {
  const icon = activityIcons[type];
  if (!icon) return null;
  return (
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
  );
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "A l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header with user info */}
      <div className="mb-3 flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {activity.user.avatar_url ? (
            <img
              src={activity.user.avatar_url}
              alt={activity.user.username}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            activity.user.display_name?.[0]?.toUpperCase() ||
            activity.user.username[0].toUpperCase()
          )}
        </div>

        {/* Icon + username + action */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center text-muted-foreground">
              <ActivityIcon type={activity.type} />
            </span>
            <span className="font-semibold">
              {activity.user.display_name || activity.user.username}
            </span>
            <span className="text-muted-foreground">
              {activityMessages[activity.type]}
            </span>
          </div>
        </div>

        {/* Date */}
        <span className="ml-auto shrink-0 text-sm text-muted-foreground">
          {formatDate(activity.created_at)}
        </span>
      </div>

      {/* Activity content based on type */}
      {(activity.type === "song_added" || activity.type === "song_mastered") && activity.song && (
        <div className="flex items-center gap-3 rounded-xl bg-accent/30 p-3">
          {activity.song.cover_url ? (
            <img
              src={activity.song.cover_url}
              alt={activity.song.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <span className="material-symbols-outlined text-2xl text-muted-foreground">music_note</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{activity.song.title}</div>
            <div className="truncate text-sm text-muted-foreground">{activity.song.artist}</div>
          </div>
          {activity.type === "song_mastered" && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <span className="material-symbols-outlined text-[20px]">check</span>
            </div>
          )}
        </div>
      )}

      {activity.type === "cover_posted" && activity.cover && (
        <div className="overflow-hidden rounded-xl bg-accent/30">
          <div className="relative aspect-video bg-muted">
            {activity.cover.thumbnail_url ? (
              <img
                src={activity.cover.thumbnail_url}
                alt={`Cover de ${activity.cover.song.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                src={activity.cover.media_url}
                className="h-full w-full object-cover"
                muted
                preload="metadata"
              />
            )}
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:scale-110">
                <span className="material-symbols-outlined text-3xl">play_arrow</span>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="font-semibold">{activity.cover.song.title}</div>
            <div className="text-sm text-muted-foreground">{activity.cover.song.artist}</div>
          </div>
        </div>
      )}

      {activity.type === "friend_added" && activity.friend && (
        <div className="flex items-center gap-3 rounded-xl bg-accent/30 p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {activity.friend.avatar_url ? (
              <img
                src={activity.friend.avatar_url}
                alt={activity.friend.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              activity.friend.display_name?.[0]?.toUpperCase() ||
              activity.friend.username[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">
              {activity.friend.display_name || activity.friend.username}
            </div>
            <div className="truncate text-sm text-muted-foreground">@{activity.friend.username}</div>
          </div>
        </div>
      )}

      {activity.type === "song_wishlisted" && activity.wishlistSong && (
        <div className="flex items-center gap-3 rounded-xl bg-accent/30 p-3">
          {activity.wishlistSong.cover_url ? (
            <img
              src={activity.wishlistSong.cover_url}
              alt={activity.wishlistSong.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <span className="material-symbols-outlined text-2xl text-muted-foreground">music_note</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{activity.wishlistSong.title}</div>
            <div className="truncate text-sm text-muted-foreground">{activity.wishlistSong.artist}</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
            <span className="material-symbols-outlined text-[18px]">star</span>
          </div>
        </div>
      )}

      {activity.type === "setlist_created" && activity.metadata && (
        <div className="flex items-center gap-3 rounded-xl bg-accent/30 p-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-3xl">playlist_add</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{activity.metadata.name as string}</div>
            <div className="truncate text-sm text-muted-foreground">
              {activity.metadata.is_band ? "Setlist de groupe" : "Setlist personnelle"}
            </div>
          </div>
        </div>
      )}

      {(activity.type === "band_created" || activity.type === "band_joined") && activity.metadata && (
        <div className="flex items-center gap-3 rounded-xl bg-accent/30 p-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
            <span className="material-symbols-outlined text-3xl">groups</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{activity.metadata.band_name as string}</div>
            <div className="truncate text-sm text-muted-foreground">
              {activity.type === "band_created" ? "Nouveau groupe" : "A rejoint le groupe"}
            </div>
          </div>
        </div>
      )}

      {activity.type.startsWith("challenge_") && activity.metadata && (
        <div className={`flex items-center gap-3 rounded-xl p-3 ${
          activity.type === "challenge_won"
            ? "bg-yellow-500/10"
            : "bg-accent/30"
        }`}>
          <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${
            activity.type === "challenge_won"
              ? "bg-yellow-500/20 text-yellow-500"
              : "bg-primary/20 text-primary"
          }`}>
            <span className="material-symbols-outlined text-3xl">emoji_events</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">
              {activity.metadata.challenge_type === "practice_time" && "Defi temps de pratique"}
              {activity.metadata.challenge_type === "streak" && "Defi streak"}
              {activity.metadata.challenge_type === "song_mastery" && "Defi maitrise"}
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {activity.metadata.opponent_name ? `Contre ${String(activity.metadata.opponent_name)}` : null}
            </div>
          </div>
          {activity.type === "challenge_won" && (
            <span className="text-2xl">🏆</span>
          )}
        </div>
      )}
    </div>
  );
}
