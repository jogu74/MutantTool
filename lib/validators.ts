import { z } from "zod";

const skillTypeSchema = z.enum(["NATURAL", "TRAINED"]);
export const recordIdSchema = z.string().trim().min(1).max(191);

export const characterIdSchema = z.object({
  characterId: recordIdSchema
});

export const updateCharacterSchema = z.object({
  characterId: recordIdSchema,
  name: z.string().min(1).max(120),
  playerName: z.string().min(1).max(120),
  className: z.string().max(120).nullable(),
  formerOccupation: z.string().max(120).nullable(),
  home: z.string().max(120).nullable(),
  age: z.string().max(40).nullable(),
  gender: z.string().max(40).nullable(),
  length: z.string().max(40).nullable(),
  weight: z.string().max(40).nullable(),
  appearance: z.string().max(500).nullable(),
  reputation: z.string().max(120).nullable(),
  status: z.string().max(120).nullable(),
  bodyPoints: z.coerce.number().int().min(-99).max(999),
  traumaThreshold: z.coerce.number().int().min(0).max(999),
  traumaThresholdManual: z.coerce.number().int().min(0).max(999).nullable(),
  kroncreditsOnHand: z.coerce.number().int().min(0).max(999999),
  kroncreditsStash: z.coerce.number().int().min(0).max(999999),
  creditsOnHand: z.coerce.number().int().min(0).max(999999),
  creditsStash: z.coerce.number().int().min(0).max(999999),
  jacksOnHand: z.coerce.number().int().min(0).max(999999),
  jacksStash: z.coerce.number().int().min(0).max(999999),
  notes: z.string().max(5000).nullable()
});

export const updateStatsSchema = z.object({
  characterId: recordIdSchema,
  strength: z.coerce.number().int().min(0).max(99),
  physique: z.coerce.number().int().min(0).max(99),
  size: z.coerce.number().int().min(0).max(99),
  agility: z.coerce.number().int().min(0).max(99),
  intelligence: z.coerce.number().int().min(0).max(99),
  willpower: z.coerce.number().int().min(0).max(99),
  personality: z.coerce.number().int().min(0).max(99)
});

export const skillUpdateSchema = z.object({
  id: recordIdSchema,
  name: z.string().min(1).max(120),
  type: skillTypeSchema,
  skillValue: z.coerce.number().int().min(-99).max(999),
  modifier: z.coerce.number().int().min(-99).max(999)
});

export const skillCreateSchema = z.object({
  characterId: recordIdSchema,
  type: skillTypeSchema,
  name: z.string().min(1).max(120).default("Ny färdighet")
});

export const deleteByIdSchema = z.object({
  id: recordIdSchema
});

export const weaponSchema = z.object({
  id: recordIdSchema,
  name: z.string().min(1).max(120),
  hitChance: z.coerce.number().int().min(-99).max(999),
  initiative: z.coerce.number().int().min(-99).max(999),
  damage: z.string().max(40).nullable(),
  penetration: z.coerce.number().int().min(-99).max(999),
  range: z.string().max(120).nullable(),
  rateOfFire: z.string().max(40).nullable(),
  minStrength: z.coerce.number().int().min(0).max(99),
  ammoCurrent: z.coerce.number().int().min(0).max(999),
  ammoMax: z.coerce.number().int().min(0).max(999),
  weight: z.coerce.number().min(0).max(999),
  notes: z.string().max(500).nullable()
});

export const weaponCreateSchema = z.object({
  characterId: recordIdSchema
});

export const equipmentItemSchema = z.object({
  id: recordIdSchema,
  name: z.string().min(1).max(120),
  weight: z.coerce.number().min(0).max(999),
  quantity: z.coerce.number().int().min(0).max(999),
  notes: z.string().max(500).nullable(),
  equipped: z.boolean()
});

export const armorItemSchema = z.object({
  id: recordIdSchema,
  name: z.string().min(1).max(120),
  armorValue: z.coerce.number().int().min(0).max(99),
  protection: z.string().max(120).nullable(),
  weight: z.coerce.number().min(0).max(999),
  location: z.string().max(120).nullable()
});

export const inventoryCreateSchema = z.object({
  characterId: recordIdSchema
});

export const journalEntrySchema = z.object({
  title: z.string().max(160).nullable(),
  content: z.string().min(1).max(10000),
  characterId: recordIdSchema.nullable()
});

export const journalUpdateSchema = z.object({
  id: recordIdSchema,
  title: z.string().max(160).nullable(),
  content: z.string().min(1).max(10000)
});

export const backupDownloadSchema = z.object({
  snapshotId: recordIdSchema
});

const backupUserSchema = z.object({
  id: recordIdSchema,
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(1).max(120),
  role: z.enum(["PLAYER", "ADMIN"]),
  accessToken: z.string().trim().min(16).max(191).optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
});

const backupStatsSchema = z.object({
  characterId: recordIdSchema,
  strength: z.coerce.number().int().min(0).max(99),
  physique: z.coerce.number().int().min(0).max(99),
  size: z.coerce.number().int().min(0).max(99),
  agility: z.coerce.number().int().min(0).max(99),
  intelligence: z.coerce.number().int().min(0).max(99),
  willpower: z.coerce.number().int().min(0).max(99),
  personality: z.coerce.number().int().min(0).max(99),
  damageBonus: z.coerce.number().int().min(-99).max(999),
  initiativeBonus: z.coerce.number().int().min(-99).max(999),
  carryingCapacity: z.coerce.number().int().min(-99).max(999),
  reactionValue: z.coerce.number().int().min(-99).max(999)
});

const backupSkillSchema = z.object({
  id: recordIdSchema,
  characterId: recordIdSchema,
  name: z.string().min(1).max(120),
  type: skillTypeSchema,
  skillValue: z.coerce.number().int().min(-99).max(999),
  modifier: z.coerce.number().int().min(-99).max(999),
  finalValue: z.coerce.number().int().min(-99).max(999),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
});

const backupWeaponSchema = z.object({
  id: recordIdSchema,
  characterId: recordIdSchema,
  name: z.string().min(1).max(120),
  hitChance: z.coerce.number().int().min(-99).max(999),
  initiative: z.coerce.number().int().min(-99).max(999),
  damage: z.string().max(40).nullable(),
  penetration: z.coerce.number().int().min(-99).max(999),
  range: z.string().max(120).nullable(),
  rateOfFire: z.string().max(40).nullable(),
  minStrength: z.coerce.number().int().min(0).max(99),
  ammoCurrent: z.coerce.number().int().min(0).max(999),
  ammoMax: z.coerce.number().int().min(0).max(999),
  weight: z.coerce.number().min(0).max(999),
  notes: z.string().max(500).nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
});

const backupEquipmentSchema = z.object({
  id: recordIdSchema,
  characterId: recordIdSchema,
  name: z.string().min(1).max(120),
  weight: z.coerce.number().min(0).max(999),
  quantity: z.coerce.number().int().min(0).max(999),
  notes: z.string().max(500).nullable(),
  equipped: z.boolean(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
});

const backupArmorSchema = z.object({
  id: recordIdSchema,
  characterId: recordIdSchema,
  name: z.string().min(1).max(120),
  armorValue: z.coerce.number().int().min(0).max(99),
  protection: z.string().max(120).nullable(),
  weight: z.coerce.number().min(0).max(999),
  location: z.string().max(120).nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
});

const backupCharacterSchema = z.object({
  id: recordIdSchema,
  campaignId: recordIdSchema,
  userId: recordIdSchema,
  name: z.string().min(1).max(120),
  playerName: z.string().min(1).max(120),
  className: z.string().max(120).nullable(),
  formerOccupation: z.string().max(120).nullable().optional(),
  home: z.string().max(120).nullable(),
  age: z.string().max(40).nullable(),
  gender: z.string().max(40).nullable(),
  length: z.string().max(40).nullable(),
  weight: z.string().max(40).nullable(),
  appearance: z.string().max(500).nullable(),
  reputation: z.string().max(120).nullable(),
  status: z.string().max(120).nullable(),
  bodyPoints: z.coerce.number().int().min(-99).max(999),
  traumaThreshold: z.coerce.number().int().min(0).max(999),
  traumaThresholdManual: z.coerce.number().int().min(0).max(999).nullable().optional(),
  notes: z.string().max(5000).nullable(),
  kroncreditsOnHand: z.coerce.number().int().min(0).max(999999),
  kroncreditsStash: z.coerce.number().int().min(0).max(999999),
  creditsOnHand: z.coerce.number().int().min(0).max(999999),
  creditsStash: z.coerce.number().int().min(0).max(999999),
  jacksOnHand: z.coerce.number().int().min(0).max(999999),
  jacksStash: z.coerce.number().int().min(0).max(999999),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: backupUserSchema.optional(),
  stats: backupStatsSchema.nullable().optional(),
  skills: z.array(backupSkillSchema),
  weapons: z.array(backupWeaponSchema),
  equipmentItems: z.array(backupEquipmentSchema),
  armorItems: z.array(backupArmorSchema)
});

const backupJournalEntrySchema = z.object({
  id: recordIdSchema,
  campaignId: recordIdSchema,
  characterId: recordIdSchema.nullable(),
  authorId: recordIdSchema,
  title: z.string().max(160).nullable(),
  content: z.string().min(1).max(10000),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  author: backupUserSchema.optional(),
  character: z
    .object({
      id: recordIdSchema,
      name: z.string().min(1).max(120)
    })
    .nullable()
    .optional()
});

export const backupImportSchema = z.object({
  exportedAt: z.string().optional(),
  campaign: z.object({
    id: recordIdSchema,
    name: z.string().min(1).max(160),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    users: z.array(backupUserSchema).optional().default([]),
    characters: z.array(backupCharacterSchema),
    journalEntries: z.array(backupJournalEntrySchema)
  })
});

export const accountProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320)
});

export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(6).max(120),
    newPassword: z.string().min(8).max(120),
    confirmPassword: z.string().min(8).max(120)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Lösenorden matchar inte.",
    path: ["confirmPassword"]
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Det nya lösenordet måste skilja sig från det nuvarande.",
    path: ["newPassword"]
  });

export const adminResetPasswordSchema = z.object({
  userId: recordIdSchema,
  newPassword: z.string().min(8).max(120)
});

export const adminCreatePlayerSchema = z.object({
  playerName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  characterName: z.string().trim().min(1).max(120)
});

export const adminDeletePlayerSchema = z.object({
  userId: recordIdSchema
});

export const adminRotateAccessLinkSchema = z.object({
  userId: recordIdSchema
});
