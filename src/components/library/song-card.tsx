"use client";

import type { Song, SongStatus, SongDifficulty } from "@/types";

interface SongCardProps {
  song: Song;
  onClick: () => void;
}

const statusLabels: Record<SongStatus, string> = {
  want_to_learn: "A apprendre",
  learning: "En cours",
  mastered: "Maitrise",
};

const statusColors: Record<SongStatus, string> = {
  want_to_learn: "bg-muted text-muted-foreground",
  learning: "bg-primary/15 text-primary",
  mastered: "bg-green-500/15 text-green-400",
};

const difficultyLabels: Record<string, string> = {
  beginner: "EASY",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
  expert: "EXPERT",
};

const difficultyColors: Record<SongDifficulty, string> = {
  beginner: "bg-green-500/20 text-green-400",
  intermediate: "bg-blue-500/20 text-blue-400",
  advanced: "bg-red-500/20 text-red-400",
  expert: "bg-red-500/20 text-red-400",
};

export function SongCard({ song, onClick }: SongCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-start gap-4 rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/[0.02]"
    >
      {/* Album art */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.album || song.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="material-symbols-outlined text-2xl text-muted-foreground">music_note</span>
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold">{song.title}</h3>
        <p className="truncate text-sm text-muted-foreground">{song.artist}</p>

        {/* Meta line */}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {song.tuning && <span>{song.tuning}</span>}
          {song.spotify_bpm && (
            <>
              <span>•</span>
              <span>{Math.round(song.spotify_bpm)} BPM</span>
            </>
          )}
          {song.capo_position > 0 && (
            <>
              <span>•</span>
              <span>Capo {song.capo_position}</span>
            </>
          )}
        </div>

        {/* Difficulty badge */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {song.difficulty && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${difficultyColors[song.difficulty]}`}>
              {difficultyLabels[song.difficulty]}
            </span>
          )}
          {song.status !== "want_to_learn" && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColors[song.status]}`}>
              {statusLabels[song.status]}
              {song.status === "learning" && ` ${song.progress_percent}%`}
            </span>
          )}
          {song.tabs_url && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              Tab
            </span>
          )}
          {(song.covers_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
              <span className="material-symbols-outlined text-[13px]">videocam</span>
              {song.covers_count}
            </span>
          )}
        </div>
      </div>

      {/* More menu icon */}
      <span className="material-symbols-outlined flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        more_vert
      </span>
    </button>
  );
}
