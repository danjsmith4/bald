import { SlashCommandBuilder } from "discord.js";

export const statsCommand = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Look up an Old School RuneScape player and render their stats card.")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("The OSRS username to look up")
      .setRequired(true)
      .setMaxLength(12)
  );

export const questCommand = new SlashCommandBuilder()
  .setName("quest")
  .setDescription("Check whether an OSRS player meets a quest's Wiki requirements.")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("The OSRS username to check")
      .setRequired(true)
      .setMaxLength(12)
  )
  .addStringOption((option) =>
    option
      .setName("quest")
      .setDescription("The quest to check")
      .setRequired(true)
      .setAutocomplete(true)
  );

export const accountsCommand = new SlashCommandBuilder()
  .setName("accounts")
  .setDescription("Preview finished stats for a Bald Services prebuilt account.")
  .addStringOption((option) =>
    option
      .setName("build")
      .setDescription("The prebuilt account package to preview")
      .setRequired(true)
      .addChoices(
        { name: "Iron - SOTE From Scratch", value: "iron-sote" },
        { name: "Iron - Quest Cape From Scratch", value: "iron-quest-cape" },
        { name: "Iron - Barrows Gloves From Scratch", value: "iron-barrows-gloves" },
        { name: "Main - TOA Ready", value: "main-toa-ready" },
        { name: "Main - Quest Cape", value: "main-quest-cape" },
        { name: "Main - Desert Treasure II", value: "main-dt2" }
      )
  );

export const commands = [statsCommand, questCommand, accountsCommand];
