import { getUserAlbumReviews } from "@/lib/actions/albums";
import { createClient } from "@/lib/supabase/server";
import { AlbumsView } from "@/components/albums/albums-view";

export default async function AlbumsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const reviews = await getUserAlbumReviews();

  return (
    <AlbumsView
      initialReviews={reviews}
      userPlan={profile?.plan || "free"}
    />
  );
}
