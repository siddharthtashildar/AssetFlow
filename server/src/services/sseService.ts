import { Response } from "express";

interface SSEClient {
  id: string;
  res: Response;
}

class SSEService {
  private clients: SSEClient[] = [];

  addClient(id: string, res: Response) {
    this.clients.push({ id, res });
    console.log(`[SSE] Client connected: ${id}. Total clients: ${this.clients.length}`);
  }

  removeClient(id: string) {
    this.clients = this.clients.filter((client) => client.id !== id);
    console.log(`[SSE] Client disconnected: ${id}. Total clients: ${this.clients.length}`);
  }

  broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    console.log(`[SSE] Broadcasting event: ${event} to ${this.clients.length} clients`);
    this.clients.forEach((client) => {
      try {
        client.res.write(payload);
      } catch (err) {
        console.error(`[SSE] Failed to send SSE to client ${client.id}:`, err);
      }
    });
  }
}

export const sseService = new SSEService();
