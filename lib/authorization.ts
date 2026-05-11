import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/app/character");
  }

  return user;
}

export async function assertCanAccessCharacter(userId: string, characterId: string) {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    return user;
  }

  const character = await db.character.findFirst({
    where: {
      id: characterId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!character || user.id !== userId) {
    throw new Error("Otillåten åtkomst till karaktär.");
  }

  return user;
}

export async function requireCharacterAccess(characterId: string) {
  const user = await requireUser();

  const character = await db.character.findUnique({
    where: { id: characterId },
    select: {
      id: true,
      userId: true,
      campaignId: true
    }
  });

  if (!character) {
    throw new Error("Karaktären kunde inte hittas.");
  }

  if (user.role !== "ADMIN" && character.userId !== user.id) {
    throw new Error("Otillåten åtkomst till karaktär.");
  }

  return {
    user,
    character
  };
}
