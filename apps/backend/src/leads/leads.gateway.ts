/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: <WebSocketGateway> */
import { WebSocketGateway } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  },
})
export class LeadsGateway {
  private clients: Socket[] = [];

  handleConnection(client: Socket) {
    console.log('✅ New client connected:', client.id);

    // Listen for "login" event to store device and user info
    client.on('login', (data: { userId: number; deviceId: string }) => {
      const { userId, deviceId } = data;
      client.data = { userId, deviceId };

      // Check if the same user is logged in on another device
      const existingClient = this.clients.find(
        (c) =>
          c.data?.userId === userId &&
          c.id !== client.id &&
          c.data?.deviceId !== deviceId
      );

      if (existingClient) {
        console.log(`⚠️ User ${userId} logged in on a new device. Forcing logout on old device.`);
        existingClient.emit('FORCE_LOGOUT');
        existingClient.disconnect(true);
      }

      this.clients.push(client);
    });
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Client disconnected:', client.id);
    this.clients = this.clients.filter((c) => c !== client);
  }

  emitCreateLead(data: any) {
    this.clients.forEach((client) => client.emit('createLeadResponse', data));
  }

  emitUpdateLead(data: any) {
    this.clients.forEach((client) => client.emit('updatedLeadResponse', data));
  }

  emitRemoveLead(id: number) {
    this.clients.forEach((client) => client.emit('removedLeadResponse', id));
  }

  emitForceLogout(deviceId: string, userId: number) {
    this.clients.forEach((client) => {
      if (client.data?.deviceId === deviceId && client.data?.userId === userId) {
        client.emit('FORCE_LOGOUT');
      }
    });
  }
}
