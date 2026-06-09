import { getAuthenticatedUser } from "@/lib/supabase/server";
import { getSongs } from "@/lib/actions/songs";
import { getExercises } from "@/lib/actions/exercises";
import { getSongPracticeStats } from "@/lib/actions/practice";
import { PracticeView } from "@/components/practice/practice-view";
import type { SongPracticeStats } from "@/types";

export const metadata = {
  title: "Practice | Ostinara",
  description: "Mode Practice avec métronome intégré et exercices structurés",
};

export default async function PracticePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const [songs, exercises] = await Promise.all([
    getSongs(),
    getExercises(),
  ]);

  // Charger les stats de pratique de tous les morceaux en parallèle
  const statsEntries = await Promise.all(
    songs.map(async (song) => {
      const stats = await getSongPracticeStats(song.id);
      return stats ? [song.id, stats] as const : null;
    })
  );
  const songPracticeStats: Record<string, SongPracticeStats> = Object.fromEntries(
    statsEntries.filter((e): e is [string, SongPracticeStats] => e !== null)
  );

  return (
    <PracticeView
      songs={songs}
      exercises={exercises}
      songPracticeStats={songPracticeStats}
    />
  );
}
