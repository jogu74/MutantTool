"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireCharacterAccess } from "@/lib/authorization";
import { db } from "@/lib/db";
import {
  calculateCarryingCapacity,
  calculateDamageBonus,
  calculateInitiativeBonus,
  calculateReactionValue,
  calculateSkillFinalValue,
  calculateTraumaThreshold
} from "@/lib/rules";
import {
  armorItemSchema,
  deleteByIdSchema,
  equipmentItemSchema,
  inventoryCreateSchema,
  skillCreateSchema,
  skillUpdateSchema,
  updateCharacterSchema,
  updateStatsSchema,
  weaponCreateSchema,
  weaponSchema
} from "@/lib/validators";

function invalidateCharacterViews(characterId: string) {
  revalidatePath("/app/character");
  revalidatePath("/app/admin");
  revalidatePath(`/app/admin/characters/${characterId}`);
}

async function getCharacterIdForNestedRecord(
  model: "skill" | "weapon" | "equipmentItem" | "armorItem",
  id: string
) {
  if (model === "skill") {
    const record = await db.skill.findUnique({ where: { id }, select: { characterId: true } });
    return record?.characterId;
  }

  if (model === "weapon") {
    const record = await db.weapon.findUnique({ where: { id }, select: { characterId: true } });
    return record?.characterId;
  }

  if (model === "equipmentItem") {
    const record = await db.equipmentItem.findUnique({
      where: { id },
      select: { characterId: true }
    });
    return record?.characterId;
  }

  const record = await db.armorItem.findUnique({
    where: { id },
    select: { characterId: true }
  });
  return record?.characterId;
}

export async function updateCharacter(input: unknown) {
  const parsed = updateCharacterSchema.parse(input);
  await requireCharacterAccess(parsed.characterId);

  await db.character.update({
    where: {
      id: parsed.characterId
    },
    data: {
      name: parsed.name,
      playerName: parsed.playerName,
      className: parsed.className,
      formerOccupation: parsed.formerOccupation,
      home: parsed.home,
      age: parsed.age,
      gender: parsed.gender,
      length: parsed.length,
      weight: parsed.weight,
      appearance: parsed.appearance,
      reputation: parsed.reputation,
      status: parsed.status,
      bodyPoints: parsed.bodyPoints,
      traumaThreshold: parsed.traumaThreshold,
      traumaThresholdManual: parsed.traumaThresholdManual,
      kroncreditsOnHand: parsed.kroncreditsOnHand,
      kroncreditsStash: parsed.kroncreditsStash,
      creditsOnHand: parsed.creditsOnHand,
      creditsStash: parsed.creditsStash,
      jacksOnHand: parsed.jacksOnHand,
      jacksStash: parsed.jacksStash,
      notes: parsed.notes
    }
  });

  invalidateCharacterViews(parsed.characterId);
}

export async function updateStats(input: unknown) {
  const parsed = updateStatsSchema.parse(input);
  await requireCharacterAccess(parsed.characterId);

  const damageBonus = calculateDamageBonus(parsed.strength, parsed.size);
  const initiativeBonus = calculateInitiativeBonus(parsed.agility, parsed.intelligence);
  const carryingCapacity = calculateCarryingCapacity(parsed.strength, parsed.physique);
  const reactionValue = calculateReactionValue(parsed.agility, parsed.intelligence);
  const calculatedTraumaThreshold = calculateTraumaThreshold(parsed.physique, parsed.willpower);
  const currentCharacter = await db.character.findUnique({
    where: {
      id: parsed.characterId
    },
    select: {
      traumaThresholdManual: true
    }
  });
  const traumaThreshold = currentCharacter?.traumaThresholdManual ?? calculatedTraumaThreshold;

  await db.$transaction([
    db.characterStats.upsert({
      where: {
        characterId: parsed.characterId
      },
      update: {
        ...parsed,
        damageBonus,
        initiativeBonus,
        carryingCapacity,
        reactionValue
      },
      create: {
        ...parsed,
        damageBonus,
        initiativeBonus,
        carryingCapacity,
        reactionValue
      }
    }),
    db.character.update({
      where: {
        id: parsed.characterId
      },
      data: {
        traumaThreshold
      }
    })
  ]);

  invalidateCharacterViews(parsed.characterId);
}

export async function updateSkill(input: unknown) {
  const parsed = skillUpdateSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("skill", parsed.id);

  if (!characterId) {
    throw new Error("Färdigheten kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);

  await db.skill.update({
    where: {
      id: parsed.id
    },
    data: {
      name: parsed.name,
      type: parsed.type,
      skillValue: parsed.skillValue,
      modifier: parsed.modifier,
      finalValue: calculateSkillFinalValue(parsed.skillValue, parsed.modifier)
    }
  });

  invalidateCharacterViews(characterId);
}

export async function createSkill(input: unknown) {
  const parsed = skillCreateSchema.parse(input);
  await requireCharacterAccess(parsed.characterId);

  await db.skill.create({
    data: {
      characterId: parsed.characterId,
      name: parsed.name,
      type: parsed.type,
      skillValue: 0,
      modifier: 0,
      finalValue: 0
    }
  });

  invalidateCharacterViews(parsed.characterId);
}

export async function deleteSkill(input: unknown) {
  const parsed = deleteByIdSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("skill", parsed.id);

  if (!characterId) {
    throw new Error("Färdigheten kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);
  await db.skill.delete({ where: { id: parsed.id } });
  invalidateCharacterViews(characterId);
}

export async function updateWeapon(input: unknown) {
  const parsed = weaponSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("weapon", parsed.id);

  if (!characterId) {
    throw new Error("Vapnet kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);

  await db.weapon.update({
    where: {
      id: parsed.id
    },
    data: {
      ...parsed,
      weight: new Prisma.Decimal(parsed.weight)
    }
  });

  invalidateCharacterViews(characterId);
}

export async function createWeapon(input: unknown) {
  const parsed = weaponCreateSchema.parse(input);
  await requireCharacterAccess(parsed.characterId);

  await db.weapon.create({
    data: {
      characterId: parsed.characterId,
      name: "Nytt vapen",
      hitChance: 0,
      initiative: 0,
      damage: null,
      penetration: 0,
      range: null,
      rateOfFire: null,
      minStrength: 0,
      ammoCurrent: 0,
      ammoMax: 0,
      weight: new Prisma.Decimal(0),
      notes: null
    }
  });

  invalidateCharacterViews(parsed.characterId);
}

export async function deleteWeapon(input: unknown) {
  const parsed = deleteByIdSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("weapon", parsed.id);

  if (!characterId) {
    throw new Error("Vapnet kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);
  await db.weapon.delete({ where: { id: parsed.id } });
  invalidateCharacterViews(characterId);
}

export async function updateEquipmentItem(input: unknown) {
  const parsed = equipmentItemSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("equipmentItem", parsed.id);

  if (!characterId) {
    throw new Error("Utrustningen kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);

  await db.equipmentItem.update({
    where: {
      id: parsed.id
    },
    data: {
      ...parsed,
      weight: new Prisma.Decimal(parsed.weight)
    }
  });

  invalidateCharacterViews(characterId);
}

export async function createEquipmentItem(input: unknown) {
  const parsed = inventoryCreateSchema.parse(input);
  await requireCharacterAccess(parsed.characterId);

  await db.equipmentItem.create({
    data: {
      characterId: parsed.characterId,
      name: "Ny utrustning",
      weight: new Prisma.Decimal(0),
      quantity: 1,
      notes: null,
      equipped: false
    }
  });

  invalidateCharacterViews(parsed.characterId);
}

export async function deleteEquipmentItem(input: unknown) {
  const parsed = deleteByIdSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("equipmentItem", parsed.id);

  if (!characterId) {
    throw new Error("Utrustningen kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);
  await db.equipmentItem.delete({ where: { id: parsed.id } });
  invalidateCharacterViews(characterId);
}

export async function updateArmorItem(input: unknown) {
  const parsed = armorItemSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("armorItem", parsed.id);

  if (!characterId) {
    throw new Error("Rustningen kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);

  await db.armorItem.update({
    where: {
      id: parsed.id
    },
    data: {
      ...parsed,
      weight: new Prisma.Decimal(parsed.weight)
    }
  });

  invalidateCharacterViews(characterId);
}

export async function createArmorItem(input: unknown) {
  const parsed = inventoryCreateSchema.parse(input);
  await requireCharacterAccess(parsed.characterId);

  await db.armorItem.create({
    data: {
      characterId: parsed.characterId,
      name: "Ny rustning",
      armorValue: 0,
      protection: null,
      weight: new Prisma.Decimal(0),
      location: null
    }
  });

  invalidateCharacterViews(parsed.characterId);
}

export async function deleteArmorItem(input: unknown) {
  const parsed = deleteByIdSchema.parse(input);
  const characterId = await getCharacterIdForNestedRecord("armorItem", parsed.id);

  if (!characterId) {
    throw new Error("Rustningen kunde inte hittas.");
  }

  await requireCharacterAccess(characterId);
  await db.armorItem.delete({ where: { id: parsed.id } });
  invalidateCharacterViews(characterId);
}
