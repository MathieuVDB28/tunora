import { getFeedActivities } from "@/lib/actions/activities";
import { FeedView } from "@/components/social/feed-view";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const activities = await getFeedActivities();

  return <FeedView initialActivities={activities} currentUserId={user?.id || ""} />;
}
