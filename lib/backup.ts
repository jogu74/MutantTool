import { Prisma } from "@/generated/prisma";

import { createAccessToken, LINK_ONLY_PASSWORD_HASH } from "@/lib/access";
import { db } from "@/lib/db";
import { backupImportSchema } from "@/lib/validators";

export async function buildCampaignBackup(campaignId: string) {
  const users = await db.user.findMany({
    where: {
      OR: [
        {
          role: "ADMIN"
        },
        {
          character: {
            is: {
              campaignId
            }
          }
        }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      accessToken: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

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
              accessToken: true,
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
              role: true,
              accessToken: true,
              createdAt: true,
              updatedAt: true
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
    campaign: {
      ...campaign,
      users
    }
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

type RestoreFallbackAdmin = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
  accessToken: string;
};

function decimal(value: number) {
  return new Prisma.Decimal(value);
}

export async function restoreCampaignFromBackup(rawData: unknown, fallbackAdmin?: RestoreFallbackAdmin) {
  const parsed = backupImportSchema.parse(rawData);
  const { campaign } = parsed;

  const userMap = new Map<
    string,
    {
      id: string;
      email: string;
      name: string;
      role: "PLAYER" | "ADMIN";
      accessToken: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  >();

  for (const user of campaign.users) {
    userMap.set(user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessToken: user.accessToken ?? createAccessToken(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }

  for (const character of campaign.characters) {
    if (character.user) {
      userMap.set(character.user.id, {
        id: character.user.id,
        email: character.user.email,
        name: character.user.name,
        role: character.user.role,
        accessToken: character.user.accessToken ?? createAccessToken(),
        createdAt: character.user.createdAt,
        updatedAt: character.user.updatedAt
      });
    }
  }

  for (const entry of campaign.journalEntries) {
    if (entry.author) {
      userMap.set(entry.author.id, {
        id: entry.author.id,
        email: entry.author.email,
        name: entry.author.name,
        role: entry.author.role,
        accessToken: entry.author.accessToken ?? createAccessToken(),
        createdAt: entry.author.createdAt,
        updatedAt: entry.author.updatedAt
      });
    }
  }

  if (fallbackAdmin && !Array.from(userMap.values()).some((user) => user.role === "ADMIN")) {
    userMap.set(fallbackAdmin.id, fallbackAdmin);
  }

  await db.$transaction(async (tx) => {
    await tx.backupSnapshot.deleteMany();
    await tx.journalEntry.deleteMany();
    await tx.armorItem.deleteMany();
    await tx.equipmentItem.deleteMany();
    await tx.weapon.deleteMany();
    await tx.skill.deleteMany();
    await tx.characterStats.deleteMany();
    await tx.character.deleteMany();
    await tx.user.deleteMany();
    await tx.campaign.deleteMany();

    await tx.campaign.create({
      data: {
        id: campaign.id,
        name: campaign.name,
        createdAt: campaign.createdAt ?? new Date(),
        updatedAt: campaign.updatedAt ?? new Date()
      }
    });

    for (const user of userMap.values()) {
      await tx.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          passwordHash: LINK_ONLY_PASSWORD_HASH,
          accessToken: user.accessToken,
          createdAt: user.createdAt ?? new Date(),
          updatedAt: user.updatedAt ?? new Date()
        }
      });
    }

    for (const character of campaign.characters) {
      await tx.character.create({
        data: {
          id: character.id,
          campaignId: character.campaignId,
          userId: character.userId,
          name: character.name,
          playerName: character.playerName,
          className: character.className,
          formerOccupation: character.formerOccupation ?? null,
          home: character.home,
          age: character.age,
          gender: character.gender,
          length: character.length,
          weight: character.weight,
          appearance: character.appearance,
          reputation: character.reputation,
          status: character.status,
          bodyPoints: character.bodyPoints,
          traumaThreshold: character.traumaThreshold,
          traumaThresholdManual: character.traumaThresholdManual ?? null,
          notes: character.notes,
          kroncreditsOnHand: character.kroncreditsOnHand,
          kroncreditsStash: character.kroncreditsStash,
          creditsOnHand: character.creditsOnHand,
          creditsStash: character.creditsStash,
          jacksOnHand: character.jacksOnHand,
          jacksStash: character.jacksStash,
          createdAt: character.createdAt ?? new Date(),
          updatedAt: character.updatedAt ?? new Date()
        }
      });

      if (character.stats) {
        await tx.characterStats.create({
          data: character.stats
        });
      }

      if (character.skills.length > 0) {
        await tx.skill.createMany({
          data: character.skills.map((skill) => ({
            id: skill.id,
            characterId: skill.characterId,
            name: skill.name,
            type: skill.type,
            skillValue: skill.skillValue,
            modifier: skill.modifier,
            finalValue: skill.finalValue,
            createdAt: skill.createdAt ?? new Date(),
            updatedAt: skill.updatedAt ?? new Date()
          }))
        });
      }

      if (character.weapons.length > 0) {
        await tx.weapon.createMany({
          data: character.weapons.map((weapon) => ({
            id: weapon.id,
            characterId: weapon.characterId,
            name: weapon.name,
            hitChance: weapon.hitChance,
            initiative: weapon.initiative,
            damage: weapon.damage,
            penetration: weapon.penetration,
            range: weapon.range,
            rateOfFire: weapon.rateOfFire,
            minStrength: weapon.minStrength,
            ammoCurrent: weapon.ammoCurrent,
            ammoMax: weapon.ammoMax,
            weight: decimal(weapon.weight),
            notes: weapon.notes,
            createdAt: weapon.createdAt ?? new Date(),
            updatedAt: weapon.updatedAt ?? new Date()
          }))
        });
      }

      if (character.equipmentItems.length > 0) {
        await tx.equipmentItem.createMany({
          data: character.equipmentItems.map((item) => ({
            id: item.id,
            characterId: item.characterId,
            name: item.name,
            weight: decimal(item.weight),
            quantity: item.quantity,
            notes: item.notes,
            equipped: item.equipped,
            createdAt: item.createdAt ?? new Date(),
            updatedAt: item.updatedAt ?? new Date()
          }))
        });
      }

      if (character.armorItems.length > 0) {
        await tx.armorItem.createMany({
          data: character.armorItems.map((item) => ({
            id: item.id,
            characterId: item.characterId,
            name: item.name,
            armorValue: item.armorValue,
            protection: item.protection,
            weight: decimal(item.weight),
            location: item.location,
            createdAt: item.createdAt ?? new Date(),
            updatedAt: item.updatedAt ?? new Date()
          }))
        });
      }
    }

    for (const entry of campaign.journalEntries) {
      await tx.journalEntry.create({
        data: {
          id: entry.id,
          campaignId: entry.campaignId,
          characterId: entry.characterId,
          authorId: entry.authorId,
          title: entry.title,
          content: entry.content,
          createdAt: entry.createdAt ?? new Date(),
          updatedAt: entry.updatedAt ?? new Date()
        }
      });
    }
  });

  return {
    campaignName: campaign.name,
    userCount: userMap.size,
    characterCount: campaign.characters.length
  };
}
