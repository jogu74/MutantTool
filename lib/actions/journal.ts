"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/authorization";
import { db } from "@/lib/db";
import { journalEntrySchema, journalUpdateSchema, deleteByIdSchema } from "@/lib/validators";

export async function createJournalEntry(input: unknown) {
  const user = await requireUser();
  const parsed = journalEntrySchema.parse(input);

  const myCharacter = await db.character.findFirst({
    where: user.role === "ADMIN" ? undefined : { userId: user.id },
    select: {
      campaignId: true
    }
  });

  if (!myCharacter) {
    throw new Error("Ingen kampanj hittades för användaren.");
  }

  await db.journalEntry.create({
    data: {
      campaignId: myCharacter.campaignId,
      characterId: parsed.characterId,
      authorId: user.id,
      title: parsed.title,
      content: parsed.content
    }
  });

  revalidatePath("/app/journal");
}

export async function updateJournalEntry(input: unknown) {
  const user = await requireUser();
  const parsed = journalUpdateSchema.parse(input);

  const entry = await db.journalEntry.findUnique({
    where: { id: parsed.id },
    select: {
      id: true,
      authorId: true
    }
  });

  if (!entry) {
    throw new Error("Journalposten kunde inte hittas.");
  }

  if (user.role !== "ADMIN" && entry.authorId !== user.id) {
    throw new Error("Du får inte uppdatera den här journalposten.");
  }

  await db.journalEntry.update({
    where: {
      id: parsed.id
    },
    data: {
      title: parsed.title,
      content: parsed.content
    }
  });

  revalidatePath("/app/journal");
}

export async function deleteJournalEntry(input: unknown) {
  const user = await requireUser();
  const parsed = deleteByIdSchema.parse(input);

  const entry = await db.journalEntry.findUnique({
    where: { id: parsed.id },
    select: {
      id: true,
      authorId: true
    }
  });

  if (!entry) {
    throw new Error("Journalposten kunde inte hittas.");
  }

  if (user.role !== "ADMIN" && entry.authorId !== user.id) {
    throw new Error("Du får inte ta bort den här journalposten.");
  }

  await db.journalEntry.delete({
    where: {
      id: parsed.id
    }
  });

  revalidatePath("/app/journal");
}
