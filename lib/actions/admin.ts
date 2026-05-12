"use server";

import { revalidatePath } from "next/cache";

import { buildAccessPath, createAccessToken, LINK_ONLY_PASSWORD_HASH, rotateUserAccessToken, setAccessCookie } from "@/lib/access";
import { requireAdmin } from "@/lib/authorization";
import { createBackupSnapshotRecord, downloadBackupSnapshot as getSnapshot } from "@/lib/backup";
import { db } from "@/lib/db";
import { NATURAL_SKILLS } from "@/lib/game-data";
import { calculateTraumaThreshold } from "@/lib/rules";
import {
  adminCreatePlayerSchema,
  adminDeletePlayerSchema,
  adminRotateAccessLinkSchema,
  backupDownloadSchema
} from "@/lib/validators";

function invalidateAdminViews(characterId?: string) {
  revalidatePath("/app");
  revalidatePath("/app/admin");

  if (characterId) {
    revalidatePath(`/app/admin/characters/${characterId}`);
  }
}

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

export async function createPlayerWithCharacter(input: unknown) {
  await requireAdmin();
  const parsed = adminCreatePlayerSchema.parse(input);
  const email = parsed.email.toLowerCase();

  const existingUser = await db.user.findUnique({
    where: {
      email
    },
    select: {
      id: true
    }
  });

  if (existingUser) {
    throw new Error("Det finns redan ett konto med den e-postadressen.");
  }

  const campaign = await db.campaign.findFirst({
    select: {
      id: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!campaign) {
    throw new Error("Ingen kampanj hittades.");
  }

  const traumaThreshold = calculateTraumaThreshold(0, 0);
  const accessToken = createAccessToken();

  const character = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: parsed.playerName,
        passwordHash: LINK_ONLY_PASSWORD_HASH,
        accessToken,
        role: "PLAYER"
      }
    });

    const createdCharacter = await tx.character.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        name: parsed.characterName,
        playerName: parsed.playerName,
        bodyPoints: 0,
        traumaThreshold,
        notes: null,
        stats: {
          create: {
            strength: 0,
            physique: 0,
            size: 0,
            agility: 0,
            intelligence: 0,
            willpower: 0,
            personality: 0,
            damageBonus: 0,
            initiativeBonus: 0,
            carryingCapacity: 0,
            reactionValue: 0
          }
        }
      }
    });

    await tx.skill.createMany({
      data: NATURAL_SKILLS.map((name) => ({
        characterId: createdCharacter.id,
        name,
        type: "NATURAL",
        skillValue: 0,
        modifier: 0,
        finalValue: 0
      }))
    });

    await tx.skill.createMany({
      data: Array.from({ length: 4 }).map((_, index) => ({
        characterId: createdCharacter.id,
        name: `Tränad färdighet ${index + 1}`,
        type: "TRAINED",
        skillValue: 0,
        modifier: 0,
        finalValue: 0
      }))
    });

    return createdCharacter;
  });

  invalidateAdminViews(character.id);

  return {
    id: character.id,
    accessPath: buildAccessPath(accessToken)
  };
}

export async function deletePlayerAccount(input: unknown) {
  await requireAdmin();
  const parsed = adminDeletePlayerSchema.parse(input);

  const user = await db.user.findUnique({
    where: {
      id: parsed.userId
    },
    select: {
      id: true,
      role: true
    }
  });

  if (!user || user.role !== "PLAYER") {
    throw new Error("Spelaren kunde inte hittas.");
  }

  await db.user.delete({
    where: {
      id: parsed.userId
    }
  });

  invalidateAdminViews();
}

export async function rotateAccessLink(input: unknown) {
  const admin = await requireAdmin();
  const parsed = adminRotateAccessLinkSchema.parse(input);

  const user = await db.user.findUnique({
    where: {
      id: parsed.userId
    },
    select: {
      id: true,
      role: true,
      character: {
        select: {
          id: true
        }
      }
    }
  });

  if (!user) {
    throw new Error("Kontot kunde inte hittas.");
  }

  if (user.role !== "PLAYER" && user.id !== admin.id) {
    throw new Error("Endast spelarlänkar eller din egen adminlänk kan roteras här.");
  }

  const accessToken = await rotateUserAccessToken(parsed.userId);

  if (parsed.userId === admin.id) {
    await setAccessCookie(accessToken);
  }

  invalidateAdminViews(user.character?.id);

  return {
    accessPath: buildAccessPath(accessToken)
  };
}
