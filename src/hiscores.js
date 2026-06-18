import { SKILLS } from "./skills.js";
import { request } from "node:https";

const HISCORES_URL =
  "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws";

export class HiscoresError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "HiscoresError";
    this.status = status;
  }
}

export async function fetchPlayerStats(username) {
  const cleanUsername = normalizeUsername(username);
  const url = `${HISCORES_URL}?player=${encodeURIComponent(cleanUsername)}`;

  const response = await fetchText(url);

  if (response.status === 404) {
    throw new HiscoresError(`No hiscores profile found for "${cleanUsername}".`, 404);
  }

  if (response.status < 200 || response.status >= 300) {
    throw new HiscoresError(
      `The OSRS hiscores are unavailable right now. Status: ${response.status}`,
      response.status
    );
  }

  return parseHiscores(response.body, cleanUsername);
}

export function parseHiscores(csv, username = "Unknown") {
  const rows = csv.trim().split(/\r?\n/);

  if (rows.length < SKILLS.length) {
    throw new HiscoresError("The hiscores response did not include every skill.");
  }

  const skills = {};

  for (const [index, skillName] of SKILLS.entries()) {
    const [rank, level, xp] = rows[index].split(",").map((value) => Number(value));

    skills[skillName] = {
      rank,
      level,
      xp
    };
  }

  return {
    username,
    overall: skills.Overall,
    skills
  };
}

export function normalizeUsername(username) {
  return String(username ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 12);
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      {
        headers: {
          "User-Agent": "osrs-stats-discord-bot/1.0"
        }
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 500,
            body
          });
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}
