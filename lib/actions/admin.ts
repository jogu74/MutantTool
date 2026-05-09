"use server";

import { requireAdmin } from "@/lib/authorization";
import { createBackupSnapshotRecord, downloadBackupSnapshot as getSnapshot } from "@/lib/backup";
import { db } from "@/lib/db";
import { backupDownloadSchema } from "@/lib/validators";

export async function createBackupSnapshot() {
  const admin = await requireAdmin();

  const campaign = await db.character.findFirst({
    select: {
      campaignId: true
    }
  });

  if (!campaign) {
    throw new Error("Ingen kampanj hittades.");
  }

  const snapshot = await createBackupSnapshotRecord({
    campaignId: campaign.campaignId,
    createdById: admin.id
  });

  return {
    id: snapshot.id,
    createdAt: snapshot.createdAt
  };
}

export async function downloadBackupSnapshot(input: unknown) {
  await requireAdmin();
  const parsed = backupDownloadSchema.parse(input);

  return getSnapshot(parsed.snapshotId);
}
