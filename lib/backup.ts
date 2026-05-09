import { db } from "@/lib/db";

export async function buildCampaignBackup(campaignId: string) {
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      characters: {
        include: {
          stats: true,
          skills: true,
          weapons: true,
          equipmentItems: true,
          armorItems: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      },
      journalEntries: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      }
    }
  });

  if (!campaign) {
    throw new Error("Kampanjen kunde inte hittas.");
  }

  return {
    exportedAt: new Date().toISOString(),
    campaign
  };
}

export async function createBackupSnapshotRecord(input: {
  campaignId: string;
  createdById: string;
}) {
  const data = await buildCampaignBackup(input.campaignId);

  return db.backupSnapshot.create({
    data: {
      campaignId: input.campaignId,
      createdById: input.createdById,
      data
    }
  });
}

export async function downloadBackupSnapshot(snapshotId: string) {
  const snapshot = await db.backupSnapshot.findUnique({
    where: {
      id: snapshotId
    }
  });

  if (!snapshot) {
    throw new Error("Backupen kunde inte hittas.");
  }

  return snapshot;
}
