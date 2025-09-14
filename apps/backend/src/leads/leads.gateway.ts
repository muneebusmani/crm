import { WebSocketGateway, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class LeadsGateway {
  private clients: Socket[] = [];

  handleConnection(client: Socket) {
    this.clients.push(client);
  }

  handleDisconnect(client: Socket) {
    this.clients = this.clients.filter(c => c !== client);
  }

  emitCreateLead(data: any) {
    this.clients.forEach(client => client.emit('createLeadResponse', data));
  }

  emitUpdateLead(data: any) {
    this.clients.forEach(client => client.emit('updatedLeadResponse', data));
  }

  emitRemoveLead(id: number) {
    this.clients.forEach(client => client.emit('removedLeadResponse', { id }));
  }
}
