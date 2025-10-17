import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-transfer-category')
  .setDescription('Mueve el ticket actual a otra categoría.')
  .addChannelOption((option) =>
    option
      .setName('categoria')
      .setDescription('Nueva categoría para el ticket')
      .addChannelTypes(ChannelType.GuildCategory)
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

data.setDMPermission(false);

export async function execute(interaction, ticketManager) {
  const ticket = await ticketManager.getTicketByChannel(interaction.channelId);
  if (!ticket) {
    await interaction.reply({ content: 'Este comando solo puede usarse dentro de un ticket.', ephemeral: true });
    return;
  }

  const category = interaction.options.getChannel('categoria', true);
  await interaction.deferReply({ ephemeral: true });
  await ticketManager.transferCategory(ticket, category.id);
  await interaction.editReply(`Ticket movido a la categoría ${category}.`);
}
