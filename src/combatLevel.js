const COMBAT_SKILLS = [
  "Attack",
  "Defence",
  "Strength",
  "Hitpoints",
  "Ranged",
  "Prayer",
  "Magic"
];

export function calculateCombatLevel(skills) {
  for (const skill of COMBAT_SKILLS) {
    if (!skills[skill] || skills[skill].level < 1) {
      throw new Error(`Missing ${skill} level for combat calculation.`);
    }
  }

  const attack = skills.Attack.level;
  const defence = skills.Defence.level;
  const strength = skills.Strength.level;
  const hitpoints = skills.Hitpoints.level;
  const ranged = skills.Ranged.level;
  const prayer = skills.Prayer.level;
  const magic = skills.Magic.level;

  const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
  const melee = 0.325 * (attack + strength);
  const range = 0.325 * (Math.floor(ranged / 2) + ranged);
  const mage = 0.325 * (Math.floor(magic / 2) + magic);

  return Math.floor(base + Math.max(melee, range, mage));
}
