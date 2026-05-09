"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/authorization";
import { db } from "@/lib/db";
import { accountPasswordSchema, accountProfileSchema, adminResetPasswordSchema } from "@/lib/validators";

export async function updateMyAccountProfile(input: unknown) {
  const user = await requireUser();
  const parsed = accountProfileSchema.parse(input);
  const email = parsed.email.toLowerCase();

  const existingUser = await db.user.findFirst({
    where: {
      email,
      id: {
        not: user.id
      }
    },
    select: {
      id: true
    }
  });

  if (existingUser) {
    throw new Error("E-postadressen används redan av ett annat konto.");
  }

  await db.user.update({
    where: {
      id: user.id
    },
    data: {
      name: parsed.name,
      email
    }
  });

  revalidatePath("/app/account");
}

export async function updateMyPassword(input: unknown) {
  const user = await requireUser();
  const parsed = accountPasswordSchema.parse(input);

  const currentUser = await db.user.findUnique({
    where: {
      id: user.id
    },
    select: {
      passwordHash: true
    }
  });

  if (!currentUser) {
    throw new Error("Kontot kunde inte hittas.");
  }

  const passwordOk = await bcrypt.compare(parsed.currentPassword, currentUser.passwordHash);

  if (!passwordOk) {
    throw new Error("Nuvarande lösenord är fel.");
  }

  const nextPasswordHash = await bcrypt.hash(parsed.newPassword, 10);

  await db.user.update({
    where: {
      id: user.id
    },
    data: {
      passwordHash: nextPasswordHash
    }
  });

  revalidatePath("/app/account");
}

export async function adminResetPlayerPassword(input: unknown) {
  await requireAdmin();
  const parsed = adminResetPasswordSchema.parse(input);

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

  const passwordHash = await bcrypt.hash(parsed.newPassword, 10);

  await db.user.update({
    where: {
      id: parsed.userId
    },
    data: {
      passwordHash
    }
  });

  revalidatePath("/app/admin");
}
