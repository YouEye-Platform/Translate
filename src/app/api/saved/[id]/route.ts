import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, getOne } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await runMigrations();
  const { id } = await params;

  const result = await query(
    `UPDATE translations SET is_saved = NOT is_saved WHERE id = $1 AND user_id = $2`,
    [id, session.userId]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await getOne<{ is_saved: boolean }>(
    `SELECT is_saved FROM translations WHERE id = $1`,
    [id]
  );

  return NextResponse.json({ success: true, is_saved: updated?.is_saved ?? false });
}
