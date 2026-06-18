import { createCanvas, loadImage } from "@napi-rs/canvas";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCombatLevel } from "./combatLevel.js";
import { DISPLAY_SKILLS } from "./skills.js";
import { formatNumber, formatRank } from "./format.js";

const WIDTH = 560;
const HEIGHT = 850;
const BG_TOP = "#151510";
const BG_BOTTOM = "#050606";
const PANEL = "#10100d";
const TILE = "#181713";
const TILE_DARK = "#0b0c0a";
const CYAN = "#8f762a";
const CYAN_LIGHT = "#c7a84a";
const TEXT = "#f6f1e5";
const MUTED = "#a8a199";
const SHADOW = "#050403";
const EMERALD = "#0f8f67";
const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ICON_DIR = join(__dirname, "..", "assets", "skills");
const BRAND_LOGO_PATH = join(__dirname, "..", "assets", "brand", "bald_gg_logo_animated.gif");
const iconCache = new Map();
let brandLogo;

export async function renderStatsCard(player) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  const combatLevel = calculateCombatLevel(player.skills);
  const icons = await loadSkillIcons();
  const logo = await loadBrandLogo();

  drawBackground(ctx);
  drawHeader(ctx, logo, player.headerSubtitle);
  drawNamePlate(ctx, player, combatLevel);
  drawSkillGrid(ctx, player, icons);
  drawSummary(ctx, player, combatLevel);

  return canvas.toBuffer("image/png");
}

function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, BG_TOP);
  gradient.addColorStop(0.48, "#0d0e0b");
  gradient.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#4b3d18";
  ctx.lineWidth = 1;
  for (let y = 72; y < HEIGHT; y += 58) {
    ctx.beginPath();
    ctx.moveTo(14, y);
    ctx.lineTo(WIDTH - 14, y - 96);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 5;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 2;
  roundStroke(ctx, 14, 14, WIDTH - 28, HEIGHT - 28, 6);
  ctx.restore();

  drawCorner(ctx, 20, 20, 18, 18, 0);
  drawCorner(ctx, WIDTH - 38, 20, 18, 18, Math.PI / 2);
  drawCorner(ctx, WIDTH - 38, HEIGHT - 38, 18, 18, Math.PI);
  drawCorner(ctx, 20, HEIGHT - 38, 18, 18, Math.PI * 1.5);
}

function drawHeader(ctx, logo, subtitle = "OLD SCHOOL RUNESCAPE HISCORES") {
  if (logo) {
    ctx.save();
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 4;
    roundFill(ctx, 36, 30, 94, 94, 10, "#061a31");
    ctx.clip();
    ctx.drawImage(logo, 36, 30, 94, 94);
    ctx.restore();

    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2;
    roundStroke(ctx, 36, 30, 94, 94, 10);
  }

  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "900 39px Arial";
  ctx.shadowColor = SHADOW;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "#2b230f";
  ctx.fillText("BALD SERVICES", 154, 68);

  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = "#d9b74f";
  ctx.fillText("BALD SERVICES", 154, 64);

  ctx.font = "800 15px Arial";
  ctx.shadowBlur = 0;
  ctx.fillStyle = MUTED;
  ctx.fillText(subtitle, 158, 94);
  ctx.restore();
}

function drawNamePlate(ctx, player, combatLevel) {
  const x = 58;
  const y = 140;
  const w = WIDTH - 116;
  const h = 64;

  ctx.save();
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 4;
  beveledFill(ctx, x, y, w, h, 12, PANEL);
  ctx.restore();

  ctx.strokeStyle = "#b79235";
  ctx.lineWidth = 2;
  beveledStroke(ctx, x, y, w, h, 12);

  ctx.fillStyle = TEXT;
  ctx.font = "900 18px Arial";
  ctx.fillText(player.nameLabel ?? "USERNAME", x + 22, y + 27);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 28px Arial";
  fitText(ctx, player.username, x + 22, y + 54, 235);

  pill(ctx, x + w - 122, y + 17, 94, 30, `CB ${combatLevel}`);
}

function drawSkillGrid(ctx, player, icons) {
  const skills = [...DISPLAY_SKILLS, "Total", "CombatAchievements"];
  const columns = 3;
  const tileW = 154;
  const tileH = 50;
  const gapX = 18;
  const gapY = 12;
  const startX = 32;
  const startY = 234;

  skills.forEach((skill, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + col * (tileW + gapX);
    const y = startY + row * (tileH + gapY);

    if (skill === "Total") {
      drawTile(ctx, x, y, tileW, tileH, "", formatNumber(player.overall.level), icons.Total, true);
      return;
    }

    if (skill === "CombatAchievements") {
      const completed = player.combatAchievements?.completed;
      const total = player.combatAchievements?.total ?? 637;
      drawTile(
        ctx,
        x,
        y,
        tileW,
        tileH,
        "",
        `${completed ?? "--"}/${total}`,
        icons.CombatAchievements,
        completed === total
      );
      return;
    }

    const level = player.skills[skill]?.level ?? 1;
    drawTile(ctx, x, y, tileW, tileH, "", String(level), icons[skill], level >= 99);
  });
}

function drawTile(ctx, x, y, w, h, label, value, icon, highlighted = false) {
  ctx.save();
  ctx.shadowColor = highlighted ? "#b79235" : "#050403";
  ctx.shadowBlur = highlighted ? 3 : 1;
  roundFill(ctx, x, y, w, h, 7, highlighted ? "#2a240f" : TILE_DARK);
  ctx.restore();

  roundFill(ctx, x + 5, y + 5, w - 10, h - 10, 5, TILE);

  ctx.strokeStyle = highlighted ? "#b99a3e" : "#57471c";
  ctx.lineWidth = 2;
  roundStroke(ctx, x + 5, y + 5, w - 10, h - 10, 5);

  ctx.fillStyle = "rgba(225,191,88,0.12)";
  ctx.fillRect(x + 13, y + 11, w - 26, 4);

  if (icon) {
    ctx.save();
    ctx.shadowColor = SHADOW;
    ctx.shadowBlur = 5;
    ctx.drawImage(icon, x + 14, y + 9, 31, 31);
    ctx.restore();
  }

  if (label) {
    ctx.fillStyle = MUTED;
    ctx.font = "900 13px Arial";
    ctx.fillText(label, x + 52, y + 31);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = highlighted ? "#ffffff" : TEXT;
  ctx.font = "900 27px Arial";
  fitTextRight(ctx, value, x + w - 17, y + 35, label ? 70 : 94);
  ctx.textAlign = "left";
}

async function loadSkillIcons() {
  if (iconCache.size > 0) {
    return Object.fromEntries(iconCache);
  }

  const skills = [...DISPLAY_SKILLS, "Total", "CombatAchievements"];

  await Promise.all(
    skills.map(async (skill) => {
      const image = await loadImage(join(SKILL_ICON_DIR, `${skill}.png`));
      iconCache.set(skill, image);
    })
  );

  return Object.fromEntries(iconCache);
}

function drawSummary(ctx, player, combatLevel) {
  const y = 814;
  ctx.fillStyle = MUTED;
  ctx.font = "800 13px Arial";
  ctx.textAlign = "center";
  const summary = player.isStaticPreview
    ? `PREBUILT PREVIEW  |  XP ${formatNumber(player.overall.xp)}  |  COMBAT ${combatLevel}`
    : `RANK ${formatRank(player.overall.rank)}  |  XP ${formatNumber(player.overall.xp)}  |  COMBAT ${combatLevel}`;
  ctx.fillText(summary, WIDTH / 2, y);
  ctx.fillStyle = "#c7a84a";
  ctx.font = "900 13px Arial";
  ctx.fillText("Bald.gg", WIDTH / 2, y + 19);
  ctx.textAlign = "left";
}

async function loadBrandLogo() {
  if (brandLogo !== undefined) {
    return brandLogo;
  }

  try {
    brandLogo = await loadImage(BRAND_LOGO_PATH);
  } catch {
    brandLogo = null;
  }

  return brandLogo;
}

function pill(ctx, x, y, w, h, text) {
  ctx.save();
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 3;
  roundFill(ctx, x, y, w, h, 999, "#1a1609");
  ctx.restore();
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 1.5;
  roundStroke(ctx, x, y, w, h, 999);
  ctx.fillStyle = TEXT;
  ctx.font = "900 15px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + 21);
  ctx.textAlign = "left";
}

function fitText(ctx, text, x, y, maxWidth) {
  const original = ctx.font;
  let fontSize = Number(original.match(/(\d+)px/)?.[1] ?? 16);
  while (ctx.measureText(text).width > maxWidth && fontSize > 13) {
    fontSize -= 1;
    ctx.font = original.replace(/\d+px/, `${fontSize}px`);
  }
  ctx.fillText(text, x, y);
  ctx.font = original;
}

function fitTextRight(ctx, text, x, y, maxWidth) {
  const original = ctx.font;
  let fontSize = Number(original.match(/(\d+)px/)?.[1] ?? 16);
  while (ctx.measureText(text).width > maxWidth && fontSize > 13) {
    fontSize -= 1;
    ctx.font = original.replace(/\d+px/, `${fontSize}px`);
  }
  ctx.fillText(text, x, y);
  ctx.font = original;
}

function drawCorner(ctx, x, y, w, h, rotation) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotation);
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function beveledFill(ctx, x, y, width, height, cut, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  beveledPath(ctx, x, y, width, height, cut);
  ctx.fill();
}

function beveledStroke(ctx, x, y, width, height, cut) {
  ctx.beginPath();
  beveledPath(ctx, x, y, width, height, cut);
  ctx.stroke();
}

function beveledPath(ctx, x, y, width, height, cut) {
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + width - cut, y);
  ctx.lineTo(x + width, y + cut);
  ctx.lineTo(x + width, y + height - cut);
  ctx.lineTo(x + width - cut, y + height);
  ctx.lineTo(x + cut, y + height);
  ctx.lineTo(x, y + height - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

function roundFill(ctx, x, y, width, height, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  roundedPath(ctx, x, y, width, height, radius);
  ctx.fill();
}

function roundStroke(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  roundedPath(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function roundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
