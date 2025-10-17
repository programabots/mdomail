import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, '../../data/tickets.json');

async function ensureFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify({}), 'utf8');
  }
}

export class TicketStore {
  constructor() {
    this.cache = new Map();
    this.ready = false;
  }

  async init() {
    if (this.ready) return;
    await ensureFile();
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    this.cache = new Map(Object.entries(data));
    this.ready = true;
  }

  async save() {
    const data = Object.fromEntries(this.cache.entries());
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  }

  async set(ticketId, ticket) {
    await this.init();
    this.cache.set(ticketId, ticket);
    await this.save();
  }

  async delete(ticketId) {
    await this.init();
    this.cache.delete(ticketId);
    await this.save();
  }

  async get(ticketId) {
    await this.init();
    return this.cache.get(ticketId);
  }

  async findByChannel(channelId) {
    await this.init();
    for (const [, ticket] of this.cache.entries()) {
      if (ticket.channelId === channelId) return ticket;
    }
    return null;
  }

  async all() {
    await this.init();
    return Array.from(this.cache.values());
  }
}
