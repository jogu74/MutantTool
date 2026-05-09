import type { Prisma } from "@/generated/prisma";

export const characterWithRelations = {
  stats: true,
  skills: {
    orderBy: [{ type: "asc" }, { createdAt: "asc" }]
  },
  weapons: {
    orderBy: { createdAt: "asc" }
  },
  equipmentItems: {
    orderBy: { createdAt: "asc" }
  },
  armorItems: {
    orderBy: { createdAt: "asc" }
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  campaign: {
    select: {
      id: true,
      name: true
    }
  }
} satisfies Prisma.CharacterInclude;

export type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: typeof characterWithRelations;
}>;
