import type { ArmorItem, EquipmentItem, Skill, Weapon } from "@/generated/prisma";

import type { CharacterWithRelations } from "@/lib/types";
import { decimalToNumber } from "@/lib/rules";

function serializeWeapon(weapon: Weapon) {
  return {
    ...weapon,
    weight: decimalToNumber(weapon.weight)
  };
}

function serializeEquipmentItem(item: EquipmentItem) {
  return {
    ...item,
    weight: decimalToNumber(item.weight)
  };
}

function serializeArmorItem(item: ArmorItem) {
  return {
    ...item,
    weight: decimalToNumber(item.weight)
  };
}

function serializeSkill(skill: Skill) {
  return {
    ...skill
  };
}

export function serializeCharacter(character: CharacterWithRelations) {
  return {
    ...character,
    weapons: character.weapons.map(serializeWeapon),
    equipmentItems: character.equipmentItems.map(serializeEquipmentItem),
    armorItems: character.armorItems.map(serializeArmorItem),
    skills: character.skills.map(serializeSkill)
  };
}

export type SerializedCharacter = ReturnType<typeof serializeCharacter>;
