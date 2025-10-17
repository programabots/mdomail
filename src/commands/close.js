import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-close')
  .setDescription('Cierra el ticket actual y notifica al usuario.')
  .addStringOption((option) =>
    option.setName('motivo').setDescription('Motivo del cierre').setMaxLength(500)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

data.setDMPermission(false);

export async function execute(interaction, ticketManager) {
  const ticket = await ticketManager.getTicketByChannel(interaction.channelId);
  if (!ticket) {
    await interaction.reply({ content: 'Este comando solo puede usarse dentro de un ticket.', ephemeral: true });
    return;
  }

  const reason = interaction.options.getString('motivo') ?? undefined;
  await interaction.deferReply({ ephemeral: true });
  await ticketManager.closeTicket(ticket, { reason, closedBy: interaction.user.id });
  await interaction.editReply('Ticket cerrado correctamente.');
}
