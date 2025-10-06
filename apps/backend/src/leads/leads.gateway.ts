/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: <WebSocketGateway> */
import { WebSocketGateway } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // your frontend URL
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  },
})
export class LeadsGateway {
  private clients: Socket[] = [];

  handleConnection(client: Socket) {
    this.clients.push(client);
  }

  handleDisconnect(client: Socket) {
    this.clients = this.clients.filter((c) => c !== client);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <idk>
  emitCreateLead(data: any) {
    this.clients.forEach((client) => client.emit('createLeadResponse', data));
  }

  // biome-ignore lint/suspicious/noExplicitAny: <idk>
  emitUpdateLead(data: any) {
    this.clients.forEach((client) => client.emit('updatedLeadResponse', data));
  }

  emitRemoveLead(id: number) {
    this.clients.forEach((client) => client.emit('removedLeadResponse', id));
  }
}
