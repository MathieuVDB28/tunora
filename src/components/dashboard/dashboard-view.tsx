"use client";

import Link from "next/link";
import type { Song, PracticeStats, PracticeSessionWithSong, SetlistWithDetails } from "@/types";

interface DashboardViewProps {
  displayName: string;
  avatarUrl?: string;
  learningSongs: Song[];
  masteredCount: number;
  stats: PracticeStats;
  recentSessions: PracticeSessionWithSong[];
  recentSetlists: SetlistWithDetails[];
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function DashboardView({
  displayName,
  avatarUrl,
  learningSongs,
  masteredCount,
  stats,
  recentSetlists,
}: DashboardViewProps) {
  const currentFocus = learningSongs[0];
  const firstName = displayName.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <div className="flex items-center gap-3 lg:hidden mb-1">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Salut,</p>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              {firstName}
            </h1>
          </div>
        </div>
        <h1 className="hidden lg:block text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-primary via-purple-400 to-accent-teal bg-clip-text text-transparent">
            Ready to shred, {firstName} ?
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 hidden lg:block">
          Voici ton tableau de bord
        </p>
      </div>

      {/* Current Focus Card */}
      {currentFocus && (
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              En cours
            </p>
            <div className="flex items-center gap-4">
              {currentFocus.cover_url ? (
                <img
                  src={currentFocus.cover_url}
                  alt={currentFocus.title}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <span className="material-symbols-outlined text-primary text-2xl">music_note</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{currentFocus.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{currentFocus.artist}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full progress-gradient transition-all"
                      style={{ width: `${currentFocus.progress_percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-primary">{currentFocus.progress_percent}%</span>
                </div>
              </div>
            </div>
            <Link
              href="/practice"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Continue Practice
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-accent-teal/20 blur-xl" />
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-teal/10 mb-3">
              <span className="material-symbols-outlined text-accent-teal">timer</span>
            </div>
            <p className="text-2xl font-extrabold">{formatMinutes(stats.minutesThisWeek)}</p>
            <p className="text-sm text-muted-foreground">Cette semaine</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-accent-orange/20 blur-xl" />
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/10 mb-3">
              <span className="material-symbols-outlined text-accent-orange">emoji_events</span>
            </div>
            <p className="text-2xl font-extrabold">{masteredCount}</p>
            <p className="text-sm text-muted-foreground">Morceaux maitrises</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-primary/20 blur-xl" />
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
              <span className="material-symbols-outlined text-primary">local_fire_department</span>
            </div>
            <p className="text-2xl font-extrabold">{stats.currentStreak}</p>
            <p className="text-sm text-muted-foreground">Jours de streak</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5">
          <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-purple-500/20 blur-xl" />
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 mb-3">
              <span className="material-symbols-outlined text-purple-400">headphones</span>
            </div>
            <p className="text-2xl font-extrabold">{stats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">Sessions totales</p>
          </div>
        </div>
      </div>

      {/* Songs in Progress */}
      {learningSongs.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">En apprentissage</h2>
            <Link href="/library" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
            {learningSongs.slice(0, 6).map((song) => (
              <div
                key={song.id}
                className="flex-shrink-0 w-36 rounded-2xl bg-card border border-border p-3"
              >
                {song.cover_url ? (
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="h-28 w-full rounded-xl object-cover mb-2"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-xl bg-primary/10 mb-2">
                    <span className="material-symbols-outlined text-primary text-3xl">music_note</span>
                  </div>
                )}
                <p className="text-sm font-bold truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full progress-gradient"
                    style={{ width: `${song.progress_percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Setlists */}
      {recentSetlists.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Setlists recentes</h2>
            <Link href="/setlists" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
            {recentSetlists.map((setlist) => (
              <Link
                key={setlist.id}
                href={`/setlists/${setlist.id}`}
                className="flex-shrink-0 w-52 rounded-2xl bg-card border border-border p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                  <span className="material-symbols-outlined text-primary">queue_music</span>
                </div>
                <h3 className="font-bold truncate">{setlist.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {setlist.song_count} morceaux
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
