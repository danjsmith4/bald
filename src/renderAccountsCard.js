import { createCanvas, loadImage } from "@napi-rs/canvas";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 760;
const HEIGHT = 760;
const BG_TOP = "#151510";
const BG_BOTTOM = "#050606";
const PANEL = "#10100d";
const TILE = "#181713";
const TILE_DARK = "#0b0c0a";
const GOLD = "#8f762a";
const GOLD_LIGHT = "#c7a84a";
const TEXT = "#f6f1e5";
const MUTED = "#a8a199";
const GREEN = "#0f8f67";
const SHADOW = "#050403";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAND_LOGO_PATH = join(__dirname, "..", "assets", "brand", "bald_gg_logo_animated.gif");

const ACCOUNT_PACKAGES = [
  {
    type: "IRON",
    name: "SOTE From Scratch",
    subtitle: "Fresh iron build to Song of the Elves",
    tags: ["Ironman", "Questing", "Skilling"]
  },
  {
    type: "IRON",
    name: "Quest Cape From Scratch",
    subtitle: "Full quest journey on an iron account",
    tags: ["Ironman", "Quest Cape", "Long-term"]
  },
  {
    type: "IRON",
    name: "Barrows Gloves From Scratch",
    subtitle: "Recipe for Disaster path from a fresh iron",
    tags: ["Ironman", "RFD", "Core Unlock"]
  },
  {
    type: "MAIN",
    name: "TOA Ready",
    subtitle: "Main account prepared for Tombs of Amascut",
    tags: ["Main", "PvM", "Raid Ready"]
  },
  {
    type: "MAIN",
    name: "Quest Cape",
    subtitle: "Main account built around full quest completion",
    tags: ["Main", "Quest Cape", "Unlocks"]
  },
  {
    type: "MAIN",
    name: "Desert Treasure II",
    subtitle: "Main account prepared through DT2 requirements",
    tags: ["Main", "DT2", "Boss Unlocks"]
  }
];

let brandLogo;

export async function renderAccountsCard() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  const logo = await loadBrandLogo();

  drawBackground(ctx);
  drawHeader(ctx, logo);
  drawIntro(ctx);
  drawPackages(ctx);
  drawFooter(ctx);

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
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#4b3d18";
  ctx.lineWidth = 1;
  for (let y = 82; y < HEIGHT; y += 64) {
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(WIDTH - 18, y - 130);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 5;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  roundStroke(ctx, 16, 16, WIDTH - 32, HEIGHT - 32, 6);
  ctx.restore();

  drawCorner(ctx, 22, 22, 18, 18, 0);
  drawCorner(ctx, WIDTH - 40, 22, 18, 18, Math.PI / 2);
  drawCorner(ctx, WIDTH - 40, HEIGHT - 40, 18, 18, Math.PI);
  drawCorner(ctx, 22, HEIGHT - 40, 18, 18, Math.PI * 1.5);
}

function drawHeader(ctx, logo) {
  if (logo) {
    ctx.save();
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 4;
    roundFill(ctx, 46, 38, 96, 96, 10, "#10100d");
    ctx.clip();
    ctx.drawImage(logo, 46, 38, 96, 96);
    ctx.restore();

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    roundStroke(ctx, 46, 38, 96, 96, 10);
  }

  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "900 43px Arial";
  ctx.shadowColor = SHADOW;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "#2b230f";
  ctx.fillText("BALD SERVICES", 172, 80);

  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = "#d9b74f";
  ctx.fillText("BALD SERVICES", 172, 76);

  ctx.font = "800 17px Arial";
  ctx.shadowBlur = 0;
  ctx.fillStyle = MUTED;
  ctx.fillText("PREBUILT ACCOUNT PACKAGES", 176, 108);
  ctx.restore();
}

function drawIntro(ctx) {
  const x = 50;
  const y = 158;
  const w = WIDTH - 100;
  const h = 76;

  ctx.save();
  ctx.shadowColor = SHADOW;
  ctx.shadowBlur = 5;
  beveledFill(ctx, x, y, w, h, 12, PANEL);
  ctx.restore();

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  beveledStroke(ctx, x, y, w, h, 12);

  ctx.fillStyle = TEXT;
  ctx.font = "900 24px Arial";
  ctx.fillText("Choose Your Account Build", x + 24, y + 34);

  ctx.fillStyle = MUTED;
  ctx.font = "700 15px Arial";
  ctx.fillText("Static package menu. Exact completion scope can be confirmed before ordering.", x + 24, y + 58);
}

function drawPackages(ctx) {
  const startX = 50;
  const startY = 292;
  const cardW = 316;
  const cardH = 126;
  const gapX = 28;
  const gapY = 12;

  drawColumnHeader(ctx, startX + 14, 270, "IRON BUILDS", GOLD_LIGHT);
  drawColumnHeader(ctx, startX + cardW + gapX + 14, 270, "MAIN BUILDS", GREEN);

  ACCOUNT_PACKAGES.forEach((pkg, index) => {
    const col = pkg.type === "IRON" ? 0 : 1;
    const row = pkg.type === "IRON" ? index : index - 3;
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    drawPackageCard(ctx, x, y, cardW, cardH, pkg);
  });
}

function drawColumnHeader(ctx, x, y, text, color) {
  ctx.fillStyle = color;
  ctx.font = "900 15px Arial";
  ctx.fillText(text, x, y);

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x + 280, y + 10);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawPackageCard(ctx, x, y, w, h, pkg) {
  const isIron = pkg.type === "IRON";

  ctx.save();
  ctx.shadowColor = "#050403";
  ctx.shadowBlur = 3;
  roundFill(ctx, x, y, w, h, 7, TILE_DARK);
  ctx.restore();

  roundFill(ctx, x + 5, y + 5, w - 10, h - 10, 5, TILE);

  ctx.strokeStyle = isIron ? "#806727" : "#0b6f51";
  ctx.lineWidth = 2;
  roundStroke(ctx, x + 5, y + 5, w - 10, h - 10, 5);

  pill(ctx, x + 18, y + 17, isIron ? 64 : 66, 25, pkg.type, isIron ? GOLD : GREEN);

  ctx.fillStyle = TEXT;
  ctx.font = "900 21px Arial";
  fitText(ctx, pkg.name, x + 18, y + 69, w - 36);

  ctx.fillStyle = MUTED;
  ctx.font = "700 13px Arial";
  fitText(ctx, pkg.subtitle, x + 18, y + 90, w - 36);

  let tagX = x + 18;
  for (const tag of pkg.tags) {
    const tagW = Math.ceil(ctx.measureText(tag).width) + 22;
    tinyPill(ctx, tagX, y + 101, tagW, 19, tag);
    tagX += tagW + 7;
  }
}

function drawFooter(ctx) {
  ctx.fillStyle = MUTED;
  ctx.font = "800 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Ironman builds | Main builds | Questing | PvM unlocks", WIDTH / 2, 716);
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

function pill(ctx, x, y, w, h, text, color) {
  roundFill(ctx, x, y, w, h, 999, color === GREEN ? "#08291f" : "#1a1609");
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  roundStroke(ctx, x, y, w, h, 999);
  ctx.fillStyle = color === GREEN ? "#23c18e" : GOLD_LIGHT;
  ctx.font = "900 12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + 17);
  ctx.textAlign = "left";
}

function tinyPill(ctx, x, y, w, h, text) {
  roundFill(ctx, x, y, w, h, 999, "#0f0f0c");
  ctx.strokeStyle = "#3d3317";
  ctx.lineWidth = 1;
  roundStroke(ctx, x, y, w, h, 999);
  ctx.fillStyle = MUTED;
  ctx.font = "700 11px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + 13);
  ctx.textAlign = "left";
}

function fitText(ctx, text, x, y, maxWidth) {
  const original = ctx.font;
  let fontSize = Number(original.match(/(\d+)px/)?.[1] ?? 16);
  while (ctx.measureText(text).width > maxWidth && fontSize > 11) {
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
  ctx.fillStyle = GOLD;
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
