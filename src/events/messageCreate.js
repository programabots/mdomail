import { ChannelType, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

function buildRelayEmbed({ author, content, fromStaff }) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: author.tag, iconURL: author.displayAvatarURL() })
    .setDescription(content || '*Sin contenido*')
    .setTimestamp(Date.now())
    .setColor(fromStaff ? 0x5865f2 : 0x57f287);
  return embed;
}

function mapAttachments(attachments) {
  return Array.from(attachments.values()).map((attachment) => ({
    attachment: attachment.url,
    name: attachment.name
  }));
}

export function createMessageHandler(ticketManager) {
  return async (message) => {
    if (message.author.bot) return;

    if (message.channel.type === ChannelType.DM) {
      const { channel, created } = await ticketManager.createTicket(message.author);

      if (created) {
        await message.author.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('¡Hola!')
              .setDescription('Tu ticket ha sido creado. Un miembro del equipo te responderá aquí mismo.')
              .setColor(0x57f287)
          ]
        }).catch(() => null);

        await channel.send({
          content: `<@&${config.staffRoleId}> Nuevo ticket de **${message.author.tag}**`,
          embeds: [
            new EmbedBuilder()
              .setTitle('Ticket abierto')
              .setDescription('Responde en este canal para contestar al usuario.')
              .addFields({ name: 'Usuario', value: `${message.author} (${message.author.id})` })
              .setColor(0x5865f2)
          ]
        });
      }

      const files = mapAttachments(message.attachments);
      await channel.send({
        embeds: [buildRelayEmbed({ author: message.author, content: message.content, fromStaff: false })],
        files,
        allowedMentions: { parse: [] }
      });
      return;
    }

    if (!message.inGuild() || message.guild.id !== config.guildId) return;

    const ticket = await ticketManager.getTicketByChannel(message.channel.id);
    if (!ticket) return;

    const user = await message.client.users.fetch(ticket.userId).catch(() => null);
    if (!user) return;

    const files = mapAttachments(message.attachments);
    const embed = buildRelayEmbed({ author: message.author, content: message.content, fromStaff: true });

    await user.send({ embeds: [embed], files, allowedMentions: { parse: [] } }).catch(async () => {
      await message.channel.send({
        content: 'No se pudo entregar el mensaje al usuario (probablemente tiene los DMs cerrados).'
      });
    });
  };
}
