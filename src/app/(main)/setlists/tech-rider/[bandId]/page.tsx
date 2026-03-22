import { getBand } from "@/lib/actions/bands";
import { getTechRider } from "@/lib/actions/tech-riders";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TechRiderView } from "@/components/tech-rider/tech-rider-view";

interface Props {
  params: Promise<{ bandId: string }>;
}

export default async function TechRiderPage({ params }: Props) {
  const { bandId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "band") redirect("/setlists");

  const band = await getBand(bandId);
  if (!band) redirect("/setlists");

  const techRider = await getTechRider(bandId);

  const currentMember = band.members.find((m) => m.user_id === user.id);
  const canEdit =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  return (
    <TechRiderView
      band={band}
      initialData={techRider}
      canEdit={canEdit}
    />
  );
}
