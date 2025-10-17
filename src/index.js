import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config.js';
import { commands } from './commands/index.js';
import { TicketManager } from './utils/TicketManager.js';
import { createMessageHandler } from './events/messageCreate.js';
import { registerApplicationCommands } from './utils/registerCommands.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const ticketManager = new TicketManager(client);
client.commands = new Collection(commands.map((command) => [command.data.name, command]));

client.once(Events.ClientReady, async (readyClient) => {
  await ticketManager.init();
  console.log(`Bot conectado como ${readyClient.user.tag}`);

  try {
    await registerApplicationCommands(config, commands);
    console.log('Comandos slash sincronizados.');
  } catch (error) {
    if (error instanceof Error && /CLIENT_ID/.test(error.message)) {
      console.warn('CLIENT_ID no está definido; omitiendo el registro automático de comandos.');
    } else {
      console.error('No se pudieron registrar los comandos automáticamente.', error);
    }
  }
});

client.on(Events.MessageCreate, createMessageHandler(ticketManager));

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: 'Comando desconocido.', ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction, ticketManager);
  } catch (error) {
    console.error('Error ejecutando comando', error);
    const content = 'Hubo un error al ejecutar el comando.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(content);
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  }
});

client.login(config.token);
