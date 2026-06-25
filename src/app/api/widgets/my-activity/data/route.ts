import { NextResponse } from "next/server";
import { getOne, getMany } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export async function GET(request: Request) {
  await runMigrations();
  const userId = request.headers.get("x-youeye-user");
  if (!userId) {
    return NextResponse.json({
      widget_type: "custom",
      title: "My Activity",
      data: { translations_this_week: 0, languages_used: 0, chars_translated: 0, daily_counts: [] },
    });
  }

  // Stats for this week (last 7 days)
  const weekStats = await getOne<{
    count: string;
    langs: string;
    chars: string;
  }>(
    `SELECT
       COUNT(*)::text AS count,
       COUNT(DISTINCT target_lang)::text AS langs,
       COALESCE(SUM(char_count), 0)::text AS chars
     FROM translations
     WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
    [userId]
  );

  // Daily counts for the last 7 days (for a simple sparkline)
  const dailyCounts = await getMany<{ day: string; count: string }>(
    `SELECT
       TO_CHAR(created_at::date, 'Dy') AS day,
       COUNT(*)::text AS count
     FROM translations
     WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
     GROUP BY created_at::date, TO_CHAR(created_at::date, 'Dy')
     ORDER BY created_at::date`,
    [userId]
  );

  return NextResponse.json({
    widget_type: "custom",
    title: "My Activity",
    data: {
      translations_this_week: parseInt(weekStats?.count ?? "0", 10),
      languages_used: parseInt(weekStats?.langs ?? "0", 10),
      chars_translated: parseInt(weekStats?.chars ?? "0", 10),
      daily_counts: dailyCounts.map((d) => ({
        day: d.day,
        count: parseInt(d.count, 10),
      })),
    },
  });
}
