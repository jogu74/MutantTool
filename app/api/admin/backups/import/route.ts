import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/authorization";
import { restoreCampaignFromBackup } from "@/lib/backup";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen backupfil valdes." }, { status: 400 });
  }

  try {
    const rawText = await file.text();
    const rawData = JSON.parse(rawText) as unknown;
    const result = await restoreCampaignFromBackup(rawData, {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
      accessToken: admin.accessToken
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Backupen kunde inte läsas in."
      },
      { status: 400 }
    );
  }
}
