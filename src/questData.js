import { request } from "node:https";

const WIKI_API_URL = "https://oldschool.runescape.wiki/api.php";
const USER_AGENT = "osrs-stats-discord-bot/1.0";
const QUEST_STATUS_COMPLETED = 2;
const QUEST_CACHE_MS = 1000 * 60 * 60 * 12;
const QUEST_POINTS_LABEL = "Quest points";

let questCache;
let questCacheAt = 0;

export async function getQuestList() {
  const now = Date.now();

  if (questCache && now - questCacheAt < QUEST_CACHE_MS) {
    return questCache;
  }

  const quests = await fetchQuestRows();
  const questNames = new Set(quests.map((quest) => quest.name));

  questCache = quests.map((quest) => ({
    ...quest,
    requirements: parseQuestRequirements(quest.requirementsText, questNames)
  }));
  questCacheAt = now;

  return questCache;
}

export async function findQuest(query) {
  const normalizedQuery = normalizeQuestName(query);
  const quests = await getQuestList();

  return (
    quests.find((quest) => normalizeQuestName(quest.name) === normalizedQuery) ??
    quests.find((quest) => normalizeQuestName(quest.name).includes(normalizedQuery)) ??
    null
  );
}

export async function getQuestAutocompleteChoices(query) {
  const normalizedQuery = normalizeQuestName(query);
  const quests = await getQuestList();

  return quests
    .filter((quest) => normalizeQuestName(quest.name).includes(normalizedQuery))
    .slice(0, 25)
    .map((quest) => ({
      name: quest.name.slice(0, 100),
      value: quest.name.slice(0, 100)
    }));
}

export function compareQuestRequirements(quest, wikiSyncData) {
  const levels = wikiSyncData?.levels ?? {};
  const completedQuests = wikiSyncData?.quests ?? {};

  const skillChecks = quest.requirements.skills.map((requirement) => {
    const current = Number(levels[requirement.skill] ?? 1);

    return {
      ...requirement,
      current,
      met: current >= requirement.level
    };
  });

  const questChecks = quest.requirements.quests.map((requiredQuest) => ({
    name: requiredQuest,
    met: completedQuests[requiredQuest] === QUEST_STATUS_COMPLETED
  }));

  const alreadyCompleted = completedQuests[quest.name] === QUEST_STATUS_COMPLETED;

  return {
    alreadyCompleted,
    skillChecks,
    questChecks,
    questPointRequirement: quest.requirements.questPoints,
    unknownRequirements: quest.requirements.unknownRequirements,
    ready:
      !alreadyCompleted &&
      skillChecks.every((check) => check.met) &&
      questChecks.every((check) => check.met) &&
      quest.requirements.questPoints === null
  };
}

function parseQuestRequirements(requirementsText, questNames) {
  const skills = [];
  const skillMatches = requirementsText.matchAll(/data-skill="([^"]+)" data-level="(\d+)"/g);

  for (const match of skillMatches) {
    const skill = decodeEntities(match[1]);
    const level = Number(match[2]);

    if (skill === QUEST_POINTS_LABEL) {
      continue;
    }

    skills.push({ skill, level });
  }

  const questPointsMatch = requirementsText.match(
    /data-skill="Quest points" data-level="(\d+)"/
  );
  const questPoints = questPointsMatch ? Number(questPointsMatch[1]) : null;
  const quests = new Set();
  const linkMatches = requirementsText.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g);

  for (const match of linkMatches) {
    const name = decodeEntities(match[1].trim());

    if (questNames.has(name)) {
      quests.add(name);
    }
  }

  return {
    skills: dedupeSkillRequirements(skills),
    quests: [...quests],
    questPoints,
    unknownRequirements: parseUnknownRequirements(requirementsText)
  };
}

function parseUnknownRequirements(requirementsText) {
  return requirementsText
    .split(/\r?\n/)
    .map(stripWikiText)
    .filter(Boolean)
    .filter((line) => !line.includes("Completion of the following quests"))
    .filter((line) => !line.match(/^\d+ [A-Za-z ]+$/))
    .filter((line) => !line.includes("File:"))
    .slice(0, 4);
}

function dedupeSkillRequirements(skills) {
  const highest = new Map();

  for (const skill of skills) {
    const current = highest.get(skill.skill);

    if (!current || skill.level > current.level) {
      highest.set(skill.skill, skill);
    }
  }

  return [...highest.values()];
}

function stripWikiText(line) {
  return decodeEntities(
    line
      .replace(/^["'\s:*#]+/, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\[\[File:[^\]]+\]\]/g, "")
      .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?\]\]/g, "$1")
      .replace(/\{\{[^}]+\}\}/g, "")
      .replace(/\[[^\]]+\]/g, "")
      .replace(/'{2,}/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeQuestName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function decodeEntities(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchQuestRows() {
  const query =
    'bucket("quest").select("page_name", "requirements", "official_length", "start_point").limit(5000).run()';
  const params = new URLSearchParams({
    action: "bucket",
    format: "json",
    query
  });

  const response = await fetchJson(`${WIKI_API_URL}?${params}`);

  if (response.status < 200 || response.status >= 300 || !Array.isArray(response.body?.bucket)) {
    throw new Error("Could not load quest data from the OSRS Wiki.");
  }

  return response.body.bucket.map((row) => ({
    name: row.page_name,
    requirementsText: row.requirements ?? "None",
    length: row.official_length ?? "Unknown",
    startPoint: stripWikiText(row.start_point ?? "")
  }));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json"
        }
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode ?? 500,
              body: body ? JSON.parse(body) : null
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}
