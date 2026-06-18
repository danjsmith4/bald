import "dotenv/config";
import { AttachmentBuilder, Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { statsCommand } from "./commands.js";
import { fetchPlayerStats, HiscoresError, normalizeUsername } from "./hiscores.js";
import {
  compareQuestRequirements,
  findQuest,
  getQuestAutocompleteChoices
} from "./questData.js";
import { getAccountBuild } from "./accountBuilds.js";
import { renderStatsCard } from "./renderStatsCard.js";
import { fetchCombatAchievementSummary, fetchWikiSyncData } from "./wikiSync.js";

const token = process.env.DISCORD_TOKEN;
const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAND_LOGO_PATH = join(__dirname, "..", "assets", "brand", "bald_gg_logo_animated.gif");
const BRAND_LOGO_ATTACHMENT = "bald-gg-logo.gif";

if (!token) {
  throw new Error("Missing DISCORD_TOKEN in .env");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete() && interaction.commandName === "quest") {
    const focused = interaction.options.getFocused();
    const choices = await getQuestAutocompleteChoices(focused).catch(() => []);
    await interaction.respond(choices);
    return;
  }

  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName === "stats") {
    const username = normalizeUsername(interaction.options.getString("username", true));

    await interaction.deferReply();

    try {
      const player = await fetchPlayerStats(username);
      player.combatAchievements = await fetchCombatAchievementSummary(username);
      const image = await renderStatsCard(player);
      const attachment = new AttachmentBuilder(image, {
        name: `${username.replace(/[^a-z0-9_-]/gi, "_")}-osrs-stats.png`
      });

      await interaction.editReply({
        files: [attachment]
      });
    } catch (error) {
      console.error(error);

      const message =
        error instanceof HiscoresError
          ? error.message
          : "Something went wrong while building that stats card.";

      await interaction.editReply({
        content: message
      });
    }
  }

  if (interaction.commandName === "quest") {
    await handleQuestCommand(interaction);
  }

  if (interaction.commandName === "accounts") {
    await handleAccountsCommand(interaction);
  }
});

async function handleAccountsCommand(interaction) {
  const buildValue = interaction.options.getString("build", true);

  await interaction.deferReply();

  try {
    const build = getAccountBuild(buildValue);

    if (!build) {
      await interaction.editReply("I could not find that account build.");
      return;
    }

    const image = await renderStatsCard(build.player);
    const attachment = new AttachmentBuilder(image, {
      name: build.fileName
    });

    await interaction.editReply({
      files: [attachment]
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply("Something went wrong while building the accounts menu.");
  }
}

async function handleQuestCommand(interaction) {
  const username = normalizeUsername(interaction.options.getString("username", true));
  const questQuery = interaction.options.getString("quest", true);

  await interaction.deferReply();

  try {
    const [quest, wikiSyncData] = await Promise.all([
      findQuest(questQuery),
      fetchWikiSyncData(username).catch(() => null)
    ]);

    if (!quest) {
      await interaction.editReply(`I could not find an OSRS quest matching "${questQuery}".`);
      return;
    }

    if (!wikiSyncData) {
      await interaction.editReply(
        `I found **${quest.name}**, but there is no WikiSync profile for **${username}**. The player may need the RuneLite WikiSync plugin enabled.`
      );
      return;
    }

    const result = compareQuestRequirements(quest, wikiSyncData);
    const embed = buildQuestEmbed(username, quest, result);
    const logo = new AttachmentBuilder(BRAND_LOGO_PATH, {
      name: BRAND_LOGO_ATTACHMENT
    });

    await interaction.editReply({
      embeds: [embed],
      files: [logo]
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply("Something went wrong while checking that quest.");
  }
}

function buildQuestEmbed(username, quest, result) {
  const missingSkills = result.skillChecks.filter((check) => !check.met);
  const missingQuests = result.questChecks.filter((check) => !check.met);
  const completedSkills = result.skillChecks.length - missingSkills.length;
  const completedQuests = result.questChecks.length - missingQuests.length;
  const status = result.alreadyCompleted
    ? "Already completed"
    : result.ready
      ? "Ready"
      : "Missing requirements";

  const embed = new EmbedBuilder()
    .setColor(result.ready || result.alreadyCompleted ? 0xc7a84a : 0x8f762a)
    .setAuthor({
      name: "Bald Services Quest Check",
      iconURL: `attachment://${BRAND_LOGO_ATTACHMENT}`
    })
    .setThumbnail(`attachment://${BRAND_LOGO_ATTACHMENT}`)
    .setTitle(quest.name)
    .setURL(`https://oldschool.runescape.wiki/w/${encodeURIComponent(quest.name.replaceAll(" ", "_"))}`)
    .setDescription(
      [
        `**${status}** for **${username}**`,
        "Checked with OSRS Wiki quest data and the player's WikiSync profile."
      ].join("\n")
    )
    .addFields(
      {
        name: "Overview",
        value: [
          `Skills: ${completedSkills}/${result.skillChecks.length || 0}`,
          `Quest prerequisites: ${completedQuests}/${result.questChecks.length || 0}`,
          `Length: ${quest.length}`
        ].join("\n"),
        inline: true
      },
      {
        name: "Missing Skills",
        value:
          missingSkills.length > 0
            ? missingSkills
                .slice(0, 10)
                .map((check) => `• ${check.skill} ${check.current}/${check.level}`)
                .join("\n")
            : "None",
        inline: true
      },
      {
        name: "Missing Quests",
        value:
          missingQuests.length > 0
            ? missingQuests
                .slice(0, 12)
                .map((check) => `• ${check.name}`)
                .join("\n")
            : "None",
        inline: false
      }
    );

  if (result.questPointRequirement) {
    embed.addFields({
      name: "Manual Check",
      value: `Requires ${result.questPointRequirement} quest points. WikiSync does not provide quest-point totals directly.`,
      inline: false
    });
  }

  if (quest.startPoint) {
    embed.addFields({
      name: "Start",
      value: quest.startPoint.slice(0, 500),
      inline: false
    });
  }

  return embed.setFooter({
    text: "Bald Services | OSRS Wiki + WikiSync"
  });
}

client.login(token);
