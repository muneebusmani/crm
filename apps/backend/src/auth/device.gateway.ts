import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from '../user/entities/user_device.entity';

/**
 * WebSocket Gateway for real-time device management.
 * Enables instant logout when an admin revokes a device.
 *
 * Features:
 * 1. On connect: Check if device is revoked and emit logout_device if so
 * 2. Rooms: Target specific devices with device:{userId}:{fingerprint}
 * 3. Real-time: Emit logout_device when admin revokes a device
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class DeviceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(DeviceGateway.name);
  private readonly socketConnections = new Map<
    string,
    { userId: string; fingerprint: string }
  >();
  private readonly connectedFingerprintsByUser = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(UserDevice)
    private readonly deviceRepository: Repository<UserDevice>,
  ) {}

  /**
   * Handle new client connection.
   * Check device status and emit logout if device is revoked.
   */
  async handleConnection(client: Socket) {
    const fingerprint = client.handshake.query.deviceFingerprint as string;
    const userId = client.handshake.query.userId as string;

    if (!fingerprint || !userId) {
      this.logger.warn(
        `Client connected without fingerprint/userId: ${client.id}`,
      );
      return;
    }

    // Join a room specific to this device
    const room = `device:${userId}:${fingerprint}`;
    client.join(room);
    this.socketConnections.set(client.id, { userId, fingerprint });
    const fingerprints = this.connectedFingerprintsByUser.get(userId) ?? new Set();
    fingerprints.add(fingerprint);
    this.connectedFingerprintsByUser.set(userId, fingerprints);
    this.logger.log(
      `Client connected: ${client.id}, room: ${room.substring(0, 30)}...`,
    );

    // Check if device is revoked - if so, send logout immediately
    try {
      const device = await this.deviceRepository.findOne({
        where: {
          user: { id: parseInt(userId, 10) },
          deviceFingerprint: fingerprint,
        },
      });

      if (device && !device.isActive) {
        this.logger.log(
          `Device is revoked, emitting logout_device to client: ${client.id}`,
        );
        // Small delay to ensure client is ready to receive
        setTimeout(() => {
          client.emit('logout_device', {
            reason: 'device_revoked',
            message:
              'This device was revoked while you were offline. Please log in again.',
          });
        }, 500);
      } else if (!device) {
        // Device doesn't exist in DB - might be a removed device
        this.logger.log(
          `Device not found in DB, emitting logout_device to client: ${client.id}`,
        );
        setTimeout(() => {
          client.emit('logout_device', {
            reason: 'device_removed',
            message:
              'This device is no longer registered. Please log in again.',
          });
        }, 500);
      }
    } catch (error) {
      this.logger.error('Error checking device status on connect:', error);
      // Don't emit logout on error - let them proceed and API calls will handle it
    }
  }

  handleDisconnect(client: Socket) {
    const connection = this.socketConnections.get(client.id);
    if (connection) {
      const fingerprints = this.connectedFingerprintsByUser.get(connection.userId);
      if (fingerprints) {
        fingerprints.delete(connection.fingerprint);
        if (fingerprints.size === 0) {
          this.connectedFingerprintsByUser.delete(connection.userId);
        }
      }
      this.socketConnections.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit logout event to a specific device.
   * Called when admin revokes a device.
   */
  emitDeviceRevocation(userId: number, fingerprint: string): void {
    const room = `device:${userId}:${fingerprint}`;
    this.server.to(room).emit('logout_device', {
      reason: 'device_revoked',
      message: 'This device has been revoked by an administrator.',
    });
    this.logger.log(
      `Emitted logout_device to room: ${room.substring(0, 30)}...`,
    );
  }

  /**
   * Emit logout event to all devices of a user.
   * Called when admin revokes all devices.
   */
  emitLogoutAllDevices(userId: number): void {
    // Get all rooms that start with device:userId:
    const prefix = `device:${userId}:`;
    const rooms = this.server.sockets.adapter.rooms;

    for (const [roomName] of rooms) {
      if (roomName.startsWith(prefix)) {
        this.server.to(roomName).emit('logout_device', {
          reason: 'all_devices_revoked',
          message: 'All your devices have been revoked by an administrator.',
        });
      }
    }
    this.logger.log(`Emitted logout_device to all devices of user: ${userId}`);
  }

  isUserConnected(userId: number): boolean {
    return this.connectedFingerprintsByUser.has(String(userId));
  }

  /**
   * Heartbeat to keep connection alive.
   */
  @SubscribeMessage('ping')
  handlePing(_client: Socket): string {
    return 'pong';
  }
}
