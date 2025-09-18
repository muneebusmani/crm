import type { Lead } from "@crm/types";
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
        {
          // transports: ["websocket"],
          // transports: ["websocket", "polling"],
          tryAllTransports: true,
        },
      );
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Listen for lead events
  onLeadCreated(callback: (lead: Lead) => void) {
    this.socket?.on("createLeadResponse", callback);
  }

  onLeadUpdated(callback: (lead: Lead) => void) {
    this.socket?.on("updatedLeadResponse", callback);
  }

  onLeadDeleted(callback: (data: Partial<Lead>) => void) {
    this.socket?.on("removedLeadResponse", callback);
  }

  // Remove listeners
  removeLeadCreatedListener(callback: (lead: Lead) => void) {
    this.socket?.off("createLeadResponse", callback);
  }

  removeLeadUpdatedListener(callback: (lead: Lead) => void) {
    this.socket?.off("updatedLeadResponse", callback);
  }

  removeLeadDeletedListener(callback: (data: Partial<Lead>) => void) {
    this.socket?.off("removedLeadResponse", callback);
  }
}

export const socketService = new SocketService();
