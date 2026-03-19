import { getSongs } from "@/lib/actions/songs";
import { getPracticeSessions, getPracticeStats } from "@/lib/actions/practice";
import { getSetlists } from "@/lib/actions/setlists";
import { getMyProfile } from "@/lib/actions/profile";
import { getUserAlbumReviews } from "@/lib/actions/albums";
import { getCovers } from "@/lib/actions/covers";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const [songs, recentSessions, stats, setlists, profile, albumReviews, covers] = await Promise.all([
    getSongs(),
    getPracticeSessions(undefined, 5),
    getPracticeStats(),
    getSetlists(),
    getMyProfile(),
    getUserAlbumReviews(),
    getCovers(),
  ]);

  const learningSongs = songs.filter((s) => s.status === "learning");
  const masteredCount = songs.filter((s) => s.status === "mastered").length;
  const recentSetlists = setlists.slice(0, 5);

  return (
    <DashboardView
      displayName={profile?.display_name || profile?.username || "Guitariste"}
      avatarUrl={profile?.avatar_url}
      learningSongs={learningSongs}
      masteredCount={masteredCount}
      stats={stats}
      recentSessions={recentSessions}
      recentSetlists={recentSetlists}
      albumsCount={albumReviews.length}
      coversCount={covers.length}
    />
  );
}
