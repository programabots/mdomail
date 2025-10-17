import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-assign')
  .setDescription('Asigna el ticket actual a un miembro del personal.')
  .addUserOption((option) =>
    option.setName('miembro').setDescription('Persona asignada al ticket').setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

data.setDMPermission(false);

export async function execute(interaction, ticketManager) {
  const ticket = await ticketManager.getTicketByChannel(interaction.channelId);
  if (!ticket) {
    await interaction.reply({ content: 'Este comando solo puede usarse dentro de un ticket.', ephemeral: true });
    return;
  }

  const member = interaction.options.getUser('miembro', true);
  await interaction.deferReply({ ephemeral: true });
  await ticketManager.assign(ticket, member.id);
  await interaction.editReply(`Ticket asignado a ${member}.`);
}
