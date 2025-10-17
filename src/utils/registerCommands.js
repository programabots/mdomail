import { REST, Routes } from '@discordjs/rest';

export async function registerApplicationCommands(config, commands) {
  const { token, clientId, guildId } = config;

  if (!clientId) {
    throw new Error('CLIENT_ID no está configurado en las variables de entorno.');
  }

  const rest = new REST({ version: '10' }).setToken(token);
  const body = commands.map((command) => command.data.toJSON());

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
}
