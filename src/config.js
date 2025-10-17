import 'dotenv/config';

const requiredEnv = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  MODMAIL_CATEGORY_ID: process.env.MODMAIL_CATEGORY_ID,
  STAFF_ROLE_ID: process.env.STAFF_ROLE_ID
};

const missing = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
}

export const config = {
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID,
  modmailCategoryId: process.env.MODMAIL_CATEGORY_ID,
  staffRoleId: process.env.STAFF_ROLE_ID,
  transcriptChannelId: process.env.TRANSCRIPT_CHANNEL_ID ?? null,
  commandPrefix: process.env.COMMAND_PREFIX ?? '!',
  clientId: process.env.CLIENT_ID ?? null
};
