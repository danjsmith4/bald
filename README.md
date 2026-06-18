# OSRS Stats Discord Bot

Type `/stats username` in Discord and the bot will look up that player on the official Old School RuneScape hiscores, then reply with a PNG stats card showing total level, combat level, rank, XP, and all skill levels.

## Setup

1. Install Node.js 20 or newer. The bot includes a compatibility startup file for older Node 16 installs, but Node 20 is the smoothest option.
2. Open this folder in a terminal:

   ```powershell
   cd C:\Users\Dan\Scripts\osrs-stats-discord-bot
   ```

3. Install dependencies:

   ```powershell
   npm install
   ```

4. Copy `.env.example` to `.env`, then fill in:

   ```text
   DISCORD_TOKEN=...
   DISCORD_CLIENT_ID=...
   DISCORD_GUILD_ID=...
   ```

   `DISCORD_GUILD_ID` is optional, but recommended while testing because the slash command appears immediately in that server.

5. Register the slash command:

   ```powershell
   npm run register
   ```

6. Start the bot:

   ```powershell
   npm start
   ```

## Discord Developer Portal Notes

Create a bot at <https://discord.com/developers/applications>, then invite it to your server with these scopes:

- `bot`
- `applications.commands`

The bot needs permission to send messages and attach files in the channel where `/stats` is used.

## Commands

```text
/stats username:zezima
/quest username:zezima quest:Dragon Slayer II
```

The username option accepts spaces, underscores, and hyphens. If the player is not ranked on the hiscores, the bot replies with an error message.

`/quest` uses OSRS Wiki quest data and the player's WikiSync profile. It checks skill requirements and prerequisite quests. Quest-point requirements are shown as a manual check because WikiSync does not expose the player's quest-point total directly.
