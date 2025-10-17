import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';
import { TicketStore } from '../storage/TicketStore.js';

export class TicketManager {
  constructor(client) {
    this.client = client;
    this.store = new TicketStore();
  }

  async init() {
    await this.store.init();
  }

  async getTicketByUser(userId) {
    return this.store.get(userId);
  }

  async getTicketByChannel(channelId) {
    return this.store.findByChannel(channelId);
  }

  async createTicket(user) {
    await this.init();
    const guild = await this.client.guilds.fetch(config.guildId);
    const existing = await this.getTicketByUser(user.id);
    if (existing) {
      const channel = await this.client.channels.fetch(existing.channelId).catch(() => null);
      if (channel) {
        return { channel, ticket: existing, created: false };
      }
    }

    const safeName = user.username.toLowerCase().replace(/[^a-z0-9-_]/gi, '-').slice(0, 80) || 'ticket';

    const channel = await guild.channels.create({
      name: `ticket-${safeName}`,
      type: ChannelType.GuildText,
      parent: config.modmailCategoryId,
      topic: `Ticket de ${user.tag} | UsuarioID: ${user.id}`,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: config.staffRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        }
      ]
    });

    const ticketData = {
      userId: user.id,
      channelId: channel.id,
      createdAt: Date.now(),
      assignedTo: null
    };

    await this.store.set(user.id, ticketData);
    return { channel, ticket: ticketData, created: true };
  }

  async closeTicket(ticket, options = {}) {
    const { reason, closedBy } = options;
    const channel = await this.client.channels.fetch(ticket.channelId).catch(() => null);
    const user = await this.client.users.fetch(ticket.userId).catch(() => null);

    if (user) {
      await user.send({
        content: `Tu ticket ha sido cerrado${reason ? `. Motivo: ${reason}` : '.'}`
      }).catch(() => null);
    }

    if (channel) {
      await channel.send({
        content: `El ticket ha sido cerrado${closedBy ? ` por <@${closedBy}>` : ''}${reason ? `\nMotivo: ${reason}` : ''}.`
      }).catch(() => null);
      await channel.delete(`Ticket cerrado${reason ? `: ${reason}` : ''}`).catch(() => null);
    }

    await this.store.delete(ticket.userId);
  }

  async transferCategory(ticket, newCategoryId) {
    const channel = await this.client.channels.fetch(ticket.channelId);
    await channel.setParent(newCategoryId, { lockPermissions: false });
    await channel.send({
      content: `Este ticket fue movido a la categoría <#${newCategoryId}>.`
    });
  }

  async assign(ticket, staffUserId) {
    ticket.assignedTo = staffUserId;
    await this.store.set(ticket.userId, ticket);
    const channel = await this.client.channels.fetch(ticket.channelId);
    await channel.send({ content: `Ticket asignado a <@${staffUserId}>.` });
  }
}
