import { SKILLS } from "./skills.js";

const XP_BY_LEVEL = [
  0, 0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107,
  2411, 2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730,
  10824, 12031, 13363, 14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408,
  33648, 37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721,
  101333, 111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466,
  247886, 273742, 302288, 333804, 368599, 407015, 449428, 496254, 547953,
  605032, 668051, 737627, 814445, 899257, 992895, 1096278, 1210421, 1336443,
  1475581, 1629200, 1798808, 1986068, 2192818, 2421087, 2673114, 2951373,
  3258594, 3597792, 3972294, 4385776, 4842295, 5346332, 5902831, 6517253,
  7195629, 7944614, 8771558, 9684577, 10692629, 11805606, 13034431
];

const BASE_LEVELS = {
  Attack: 1,
  Defence: 1,
  Strength: 1,
  Hitpoints: 10,
  Ranged: 1,
  Prayer: 1,
  Magic: 1,
  Cooking: 1,
  Woodcutting: 1,
  Fletching: 1,
  Fishing: 1,
  Firemaking: 1,
  Crafting: 1,
  Smithing: 1,
  Mining: 1,
  Herblore: 1,
  Agility: 1,
  Thieving: 1,
  Slayer: 1,
  Farming: 1,
  Runecraft: 1,
  Hunter: 1,
  Construction: 1,
  Sailing: 1
};

const BUILDS = {
  "iron-sote": {
    displayName: "SOTE Iron",
    fileName: "iron-sote-preview.png",
    combatAchievements: { completed: null, total: 637 },
    levels: {
      Attack: 70,
      Defence: 70,
      Strength: 70,
      Hitpoints: 75,
      Ranged: 70,
      Prayer: 43,
      Magic: 80,
      Cooking: 70,
      Woodcutting: 70,
      Fletching: 70,
      Fishing: 70,
      Firemaking: 70,
      Crafting: 60,
      Smithing: 70,
      Mining: 70,
      Herblore: 70,
      Agility: 70,
      Thieving: 70,
      Slayer: 58,
      Farming: 70,
      Runecraft: 50,
      Hunter: 70,
      Construction: 70,
      Sailing: 1
    }
  },
  "iron-quest-cape": {
    displayName: "QC Iron",
    fileName: "iron-quest-cape-preview.png",
    combatAchievements: { completed: null, total: 637 },
    levels: {
      Attack: 70,
      Defence: 70,
      Strength: 70,
      Hitpoints: 50,
      Ranged: 62,
      Prayer: 50,
      Magic: 80,
      Cooking: 70,
      Woodcutting: 70,
      Fletching: 60,
      Fishing: 65,
      Firemaking: 75,
      Crafting: 70,
      Smithing: 70,
      Mining: 72,
      Herblore: 70,
      Agility: 70,
      Thieving: 72,
      Slayer: 69,
      Farming: 70,
      Runecraft: 60,
      Hunter: 70,
      Construction: 70,
      Sailing: 52
    }
  },
  "iron-barrows-gloves": {
    displayName: "B Gloves Iron",
    fileName: "iron-barrows-gloves-preview.png",
    combatAchievements: { completed: null, total: 637 },
    levels: {
      Attack: 60,
      Defence: 45,
      Strength: 60,
      Hitpoints: 60,
      Ranged: 50,
      Prayer: 43,
      Magic: 59,
      Cooking: 70,
      Woodcutting: 36,
      Fletching: 35,
      Fishing: 53,
      Firemaking: 50,
      Crafting: 40,
      Smithing: 40,
      Mining: 40,
      Herblore: 38,
      Agility: 48,
      Thieving: 53,
      Slayer: 10,
      Farming: 35,
      Runecraft: 23,
      Hunter: 27,
      Construction: 34,
      Sailing: 1
    }
  },
  "main-toa-ready": {
    displayName: "TOA Main",
    fileName: "main-toa-ready-preview.png",
    combatAchievements: { completed: null, total: 637 },
    levels: {
      Attack: 82,
      Defence: 80,
      Strength: 90,
      Hitpoints: 90,
      Ranged: 90,
      Prayer: 77,
      Magic: 94,
      Cooking: 70,
      Woodcutting: 60,
      Fletching: 40,
      Fishing: 65,
      Firemaking: 50,
      Crafting: 55,
      Smithing: 50,
      Mining: 72,
      Herblore: 60,
      Agility: 70,
      Thieving: 75,
      Slayer: 60,
      Farming: 70,
      Runecraft: 20,
      Hunter: 70,
      Construction: 40,
      Sailing: 1
    }
  },
  "main-quest-cape": {
    displayName: "QC Main",
    fileName: "main-quest-cape-preview.png",
    combatAchievements: { completed: null, total: 637 },
    levels: {
      Attack: 50,
      Defence: 65,
      Strength: 60,
      Hitpoints: 50,
      Ranged: 62,
      Prayer: 50,
      Magic: 75,
      Cooking: 65,
      Woodcutting: 70,
      Fletching: 60,
      Fishing: 60,
      Firemaking: 75,
      Crafting: 70,
      Smithing: 70,
      Mining: 70,
      Herblore: 70,
      Agility: 70,
      Thieving: 72,
      Slayer: 69,
      Farming: 70,
      Runecraft: 60,
      Hunter: 70,
      Construction: 70,
      Sailing: 52
    }
  },
  "main-dt2": {
    displayName: "DT2 Main",
    fileName: "main-dt2-preview.png",
    combatAchievements: { completed: null, total: 637 },
    levels: {
      Attack: 75,
      Defence: 75,
      Strength: 75,
      Hitpoints: 80,
      Ranged: 75,
      Prayer: 70,
      Magic: 75,
      Cooking: 70,
      Woodcutting: 70,
      Fletching: 60,
      Fishing: 62,
      Firemaking: 66,
      Crafting: 70,
      Smithing: 65,
      Mining: 72,
      Herblore: 70,
      Agility: 70,
      Thieving: 75,
      Slayer: 69,
      Farming: 70,
      Runecraft: 60,
      Hunter: 70,
      Construction: 50,
      Sailing: 1
    }
  }
};

export function getAccountBuild(value) {
  const build = BUILDS[value];

  if (!build) {
    return null;
  }

  const levels = {
    ...BASE_LEVELS,
    ...build.levels
  };
  const skills = Object.fromEntries(
    SKILLS.map((skill) => {
      if (skill === "Overall") {
        return [
          skill,
          {
            rank: -1,
            level: sumLevels(levels),
            xp: sumXp(levels)
          }
        ];
      }

      const level = levels[skill] ?? 1;
      return [
        skill,
        {
          rank: -1,
          level,
          xp: xpForLevel(level)
        }
      ];
    })
  );

  return {
    ...build,
    player: {
      username: build.displayName,
      nameLabel: "BUILD",
      headerSubtitle: "PREBUILT ACCOUNT PREVIEW",
      isStaticPreview: true,
      overall: skills.Overall,
      skills,
      combatAchievements: build.combatAchievements
    }
  };
}

function sumLevels(levels) {
  return Object.values(levels).reduce((total, level) => total + level, 0);
}

function sumXp(levels) {
  return Object.values(levels).reduce((total, level) => total + xpForLevel(level), 0);
}

function xpForLevel(level) {
  return XP_BY_LEVEL[Math.max(1, Math.min(99, level))] ?? 0;
}
