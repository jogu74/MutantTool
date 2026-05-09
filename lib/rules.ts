export function calculateSkillFinalValue(skillValue: number, modifier: number) {
  return skillValue + modifier;
}

export function calculateDamageBonus(strength: number, size: number) {
  // TODO: Verify exact Mutant UA formula against the table from the rulebook.
  return Math.floor((strength + size - 20) / 4);
}

export function calculateInitiativeBonus(agility: number, intelligence: number) {
  // TODO: Verify exact Mutant UA formula against the rulebook.
  return Math.floor((agility + intelligence) / 10);
}

export function calculateCarryingCapacity(strength: number, physique: number) {
  // TODO: Verify exact Mutant UA formula against the rulebook.
  return strength + physique;
}

export function calculateReactionValue(agility: number, intelligence: number) {
  // TODO: Verify exact Mutant UA formula against the rulebook.
  return Math.floor((agility + intelligence) / 2);
}

export function calculateTraumaThreshold(physique: number, willpower: number) {
  // TODO: Verify exact Mutant UA formula against the rulebook.
  return Math.max(1, Math.floor((physique + willpower) / 3));
}

export function decimalToNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return value?.toNumber() ?? 0;
}

export function calculateEquipmentWeight(
  items: Array<{ weight: { toNumber(): number } | number; quantity: number }>
) {
  return items.reduce((total, item) => {
    return total + decimalToNumber(item.weight) * item.quantity;
  }, 0);
}

export function calculateArmorWeight(items: Array<{ weight: { toNumber(): number } | number }>) {
  return items.reduce((total, item) => total + decimalToNumber(item.weight), 0);
}

export function calculateWeaponWeight(items: Array<{ weight: { toNumber(): number } | number }>) {
  return items.reduce((total, item) => total + decimalToNumber(item.weight), 0);
}

export function calculateTotalCarriedWeight(input: {
  equipment: Array<{ weight: { toNumber(): number } | number; quantity: number }>;
  armor: Array<{ weight: { toNumber(): number } | number }>;
  weapons: Array<{ weight: { toNumber(): number } | number }>;
}) {
  return (
    calculateEquipmentWeight(input.equipment) +
    calculateArmorWeight(input.armor) +
    calculateWeaponWeight(input.weapons)
  );
}
