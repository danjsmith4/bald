import { request } from "node:https";

const WIKISYNC_BASE_URL = "https://sync.runescape.wiki";
const WIKI_API_URL = "https://oldschool.runescape.wiki/api.php";
const USER_AGENT = "osrs-stats-discord-bot/1.0";

let combatAchievementTotalCache;

export async function fetchCombatAchievementSummary(username) {
  const [wikiSyncData, total] = await Promise.all([
    fetchWikiSyncData(username).catch(() => null),
    fetchCombatAchievementTotal().catch(() => 637)
  ]);

  return {
    completed: Array.isArray(wikiSyncData?.combat_achievements)
      ? wikiSyncData.combat_achievements.length
      : null,
    total
  };
}

export async function fetchWikiSyncData(username) {
  const url = `${WIKISYNC_BASE_URL}/runelite/player/${encodeURIComponent(username)}/STANDARD`;
  const response = await fetchJson(url);

  if (response.status < 200 || response.status >= 300) {
    return null;
  }

  return response.body;
}

async function fetchCombatAchievementTotal() {
  if (combatAchievementTotalCache) {
    return combatAchievementTotalCache;
  }

  const query = 'bucket("combat_achievement").select("id").limit(5000).run()';
  const params = new URLSearchParams({
    action: "bucket",
    format: "json",
    query
  });

  const response = await fetchJson(`${WIKI_API_URL}?${params}`);

  if (response.status < 200 || response.status >= 300 || !Array.isArray(response.body?.bucket)) {
    return 637;
  }

  combatAchievementTotalCache = response.body.bucket.length || 637;
  return combatAchievementTotalCache;
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
