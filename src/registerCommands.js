import { config } from './config.js';
import { commands } from './commands/index.js';
import { registerApplicationCommands } from './utils/registerCommands.js';

async function main() {
  try {
    console.log(`Actualizando ${commands.length} comandos (guild ${config.guildId})...`);
    await registerApplicationCommands(config, commands);
    console.log('Comandos registrados correctamente.');
  } catch (error) {
    console.error('No se pudieron registrar los comandos.', error);
    process.exit(1);
  }
}

main();
