import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/authorization";
import { downloadBackupSnapshot } from "@/lib/backup";

export async function GET(
  _request: Request,
  {
    params
  }: {
    params: Promise<{ id: string }>;
  }
) {
  await requireAdmin();
  const { id } = await params;
  const snapshot = await downloadBackupSnapshot(id);

  return new NextResponse(JSON.stringify(snapshot.data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mutant-backup-${snapshot.id}.json"`
    }
  });
}
