import { getSetlists } from "@/lib/actions/setlists";
import { getUserBands, getPendingBandInvitations } from "@/lib/actions/bands";
import { getUpcomingRehearsals } from "@/lib/actions/rehearsals";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { SetlistsView } from "@/components/setlists/setlists-view";

export default async function SetlistsPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  // Get user plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const [setlists, bands, pendingInvitations, rehearsals] = await Promise.all([
    getSetlists(),
    getUserBands(),
    getPendingBandInvitations(),
    getUpcomingRehearsals(),
  ]);

  return (
    <SetlistsView
      initialSetlists={setlists}
      bands={bands}
      pendingInvitations={pendingInvitations}
      userPlan={profile?.plan || "free"}
      currentUserId={user.id}
      initialRehearsals={rehearsals}
    />
  );
}
