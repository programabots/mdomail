import { REST, Routes } from '@discordjs/rest';
import { config } from './config.js';
import { commands } from './commands/index.js';

async function main() {
  if (!config.clientId) {
    throw new Error('CLIENT_ID no está configurado en las variables de entorno.');
  }

  const rest = new REST({ version: '10' }).setToken(config.token);
  const body = commands.map((command) => command.data.toJSON());

  try {
    console.log(`Actualizando ${body.length} comandos (guild ${config.guildId})...`);
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
    console.log('Comandos registrados correctamente.');
  } catch (error) {
    console.error('No se pudieron registrar los comandos.', error);
    process.exit(1);
  }
}

main();
