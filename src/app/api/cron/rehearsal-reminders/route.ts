import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushNotificationToMultipleUsers } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// Supabase admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Allow in dev if no secret set
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { reminders: 0, today: 0, errors: 0 };

  // === J-1 Reminders (rehearsals tomorrow) ===
  // Find rehearsals that are between 23h and 25h from now (covers the daily cron window)
  const tomorrowStart = new Date(now);
  tomorrowStart.setHours(now.getHours() + 23, 0, 0, 0);
  const tomorrowEnd = new Date(now);
  tomorrowEnd.setHours(now.getHours() + 25, 0, 0, 0);

  const { data: tomorrowRehearsals } = await supabaseAdmin
    .from("rehearsals")
    .select(`
      id, title, date, location,
      band:bands(name),
      participants:rehearsal_participants(
        user_id,
        status
      )
    `)
    .eq("status", "scheduled")
    .gte("date", tomorrowStart.toISOString())
    .lte("date", tomorrowEnd.toISOString());

  if (tomorrowRehearsals) {
    for (const rehearsal of tomorrowRehearsals) {
      const participants = (rehearsal.participants as { user_id: string; status: string }[])
        .filter((p) => p.status !== "declined");

      if (participants.length === 0) continue;

      const bandName = (rehearsal.band as unknown as { name: string })?.name || "ton groupe";
      const dateObj = new Date(rehearsal.date);
      const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      try {
        await sendPushNotificationToMultipleUsers(
          participants.map((p) => ({
            userId: p.user_id,
            payload: {
              title: "Repet demain !",
              body: `${rehearsal.title} avec ${bandName} a ${timeStr}${rehearsal.location ? ` - ${rehearsal.location}` : ""}`,
              data: { url: `/setlists/rehearsals/${rehearsal.id}` },
            },
            notificationType: "rehearsal_reminder" as const,
          }))
        );
        results.reminders += participants.length;
      } catch (err) {
        console.error("Error sending reminder:", err);
        results.errors++;
      }
    }
  }

  // === Day-of Reminders (rehearsals today) ===
  // Find rehearsals in the next 0-2h window (for the "today" notification)
  const todayStart = new Date(now);
  todayStart.setHours(now.getHours(), 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(now.getHours() + 2, 0, 0, 0);

  // Only send "today" notifications for rehearsals happening later today (at least 2h from now)
  const laterTodayStart = new Date(now);
  laterTodayStart.setHours(now.getHours() + 2, 0, 0, 0);
  const laterTodayEnd = new Date(now);
  laterTodayEnd.setHours(23, 59, 59, 999);

  const { data: todayRehearsals } = await supabaseAdmin
    .from("rehearsals")
    .select(`
      id, title, date, location,
      band:bands(name),
      participants:rehearsal_participants(
        user_id,
        status
      )
    `)
    .eq("status", "scheduled")
    .gte("date", laterTodayStart.toISOString())
    .lte("date", laterTodayEnd.toISOString());

  if (todayRehearsals) {
    for (const rehearsal of todayRehearsals) {
      const participants = (rehearsal.participants as { user_id: string; status: string }[])
        .filter((p) => p.status !== "declined");

      if (participants.length === 0) continue;

      const bandName = (rehearsal.band as unknown as { name: string })?.name || "ton groupe";
      const dateObj = new Date(rehearsal.date);
      const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      try {
        await sendPushNotificationToMultipleUsers(
          participants.map((p) => ({
            userId: p.user_id,
            payload: {
              title: "Repet aujourd'hui !",
              body: `${rehearsal.title} avec ${bandName} a ${timeStr}${rehearsal.location ? ` - ${rehearsal.location}` : ""}`,
              data: { url: `/setlists/rehearsals/${rehearsal.id}` },
            },
            notificationType: "rehearsal_today" as const,
          }))
        );
        results.today += participants.length;
      } catch (err) {
        console.error("Error sending today notification:", err);
        results.errors++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    timestamp: now.toISOString(),
  });
}
