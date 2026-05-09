import { requireAdmin, requireUser } from "@/lib/authorization";
import { db } from "@/lib/db";
import { serializeCharacter } from "@/lib/serializers";
import { characterWithRelations } from "@/lib/types";

export async function getMyCharacter() {
  const user = await requireUser();

  const character = await db.character.findFirst({
    where: {
      userId: user.id
    },
    include: characterWithRelations
  });

  if (!character) {
    throw new Error("Ingen karaktär hittades för användaren.");
  }

  return serializeCharacter(character);
}

export async function getCharacterForAdmin(characterId: string) {
  await requireAdmin();

  const character = await db.character.findUnique({
    where: {
      id: characterId
    },
    include: characterWithRelations
  });

  if (!character) {
    throw new Error("Karaktären kunde inte hittas.");
  }

  return serializeCharacter(character);
}

export async function listCharactersForAdmin() {
  await requireAdmin();

  const characters = await db.character.findMany({
    include: characterWithRelations,
    orderBy: {
      playerName: "asc"
    }
  });

  return characters.map(serializeCharacter);
}

export async function listJournalEntries() {
  const user = await requireUser();

  const campaign = await db.character.findFirst({
    where: user.role === "ADMIN" ? undefined : { userId: user.id },
    select: {
      campaignId: true
    }
  });

  if (!campaign) {
    return [];
  }

  return db.journalEntry.findMany({
    where: {
      campaignId: campaign.campaignId
    },
    include: {
      author: {
        select: {
          id: true,
          name: true
        }
      },
      character: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
