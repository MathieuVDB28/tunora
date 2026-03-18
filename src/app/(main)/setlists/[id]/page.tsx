import { notFound, redirect } from "next/navigation";
import { getSetlist } from "@/lib/actions/setlists";
import { getBandMembersSongs } from "@/lib/actions/bands";
import { getSongs } from "@/lib/actions/songs";
import { createClient } from "@/lib/supabase/server";
import { SetlistDetailView } from "@/components/setlists/setlist-detail-view";
import type { UserPlan } from "@/types";

interface SetlistPageProps {
  params: Promise<{ id: string }>;
}

export default async function SetlistPage({ params }: SetlistPageProps) {
  const { id } = await params;
  const setlist = await getSetlist(id);

  if (!setlist) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile for plan info
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const userPlan = (profile?.plan || "free") as UserPlan;

  // Get songs based on whether it's a band setlist or personal
  let songSources;
  if (setlist.band_id) {
    songSources = await getBandMembersSongs(setlist.band_id);
  } else {
    const personalSongs = await getSongs();
    songSources = [{ member: null, songs: personalSongs }];
  }

  return (
    <SetlistDetailView
      setlist={setlist}
      songSources={songSources}
      userPlan={userPlan}
    />
  );
}
