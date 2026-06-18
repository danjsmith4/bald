import "dotenv/config";
import "../src/polyfills.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) {
  throw new Error("Missing DISCORD_TOKEN in .env");
}

if (!clientId) {
  throw new Error("Missing DISCORD_CLIENT_ID in .env");
}

const [{ REST, Routes }, { commands }] = await Promise.all([
  import("discord.js"),
  import("../src/commands.js")
]);

const rest = new REST({ version: "10" }).setToken(token);
const commandBody = commands.map((command) => command.toJSON());

if (guildId) {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commandBody
  });
  console.log("Registered /stats in the configured server.");
} else {
  await rest.put(Routes.applicationCommands(clientId), {
    body: commandBody
  });
  console.log("Registered /stats globally. It can take up to an hour to appear.");
}
