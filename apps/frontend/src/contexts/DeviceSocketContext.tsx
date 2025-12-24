'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { forceLogout, getStoredFingerprint } from '@/lib/force-logout';

interface DeviceSocketContextValue {
  isConnected: boolean;
  socket: Socket | null;
}

const DeviceSocketContext = createContext<DeviceSocketContextValue>({
  isConnected: false,
  socket: null,
});

interface DeviceSocketProviderProps {
  children: ReactNode;
  userId?: number | string;
  enabled?: boolean;
}

// Global socket instance to persist across re-renders and navigation
let globalSocket: Socket | null = null;
let globalUserId: string | null = null;
let globalFingerprint: string | null = null;

/**
 * Provider that manages WebSocket connection for real-time device events.
 * Listens for 'logout_device' event and forces logout when received.
 *
 * Uses a global socket instance to prevent disconnect/reconnect on navigation.
 */
export function DeviceSocketProvider({
  children,
  userId,
  enabled = true,
}: DeviceSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const initializedRef = useRef(false);

  const handleLogoutDevice = useCallback(
    (data: { reason: string; message: string }) => {
      console.log('[DeviceSocket] 🚨 Received logout_device event:', data);
      forceLogout(data.reason || 'device_revoked');
    },
    [],
  );

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const fingerprint = getStoredFingerprint();
    if (!fingerprint) {
      // console.warn('[DeviceSocket] No device fingerprint found, skipping connection');
      return;
    }

    const userIdStr = String(userId);

    // Check if we already have a valid connection with same credentials
    if (
      globalSocket?.connected &&
      globalUserId === userIdStr &&
      globalFingerprint === fingerprint
    ) {
      // Reuse existing connection
      socketRef.current = globalSocket;
      setIsConnected(true);
      // Re-attach logout handler in case it was removed
      globalSocket.off('logout_device', handleLogoutDevice);
      globalSocket.on('logout_device', handleLogoutDevice);
      return;
    }

    // If credentials changed or no connection exists, create new one
    if (
      globalSocket &&
      (globalUserId !== userIdStr || globalFingerprint !== fingerprint)
    ) {
      // console.log('[DeviceSocket] Credentials changed, reconnecting...');
      globalSocket.disconnect();
      globalSocket = null;
    }

    if (!globalSocket && !initializedRef.current) {
      initializedRef.current = true;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const wsUrl = apiUrl.replace(/\/api(\/v1)?$/, '');

      // console.log('[DeviceSocket] Connecting to:', wsUrl);

      const newSocket = io(wsUrl, {
        query: {
          userId: userIdStr,
          deviceFingerprint: fingerprint,
        },
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      newSocket.on('connect', () => {
        console.log('[DeviceSocket] ✅ Connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('[DeviceSocket] ❌ Disconnected:', reason);
        setIsConnected(false);
        // Don't clear global socket on disconnect - let it reconnect
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, clear socket
          globalSocket = null;
          globalUserId = null;
          globalFingerprint = null;
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('[DeviceSocket] Connection error:', error.message);
      });

      newSocket.on('logout_device', handleLogoutDevice);

      // Store globally
      globalSocket = newSocket;
      globalUserId = userIdStr;
      globalFingerprint = fingerprint;
      socketRef.current = newSocket;

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping');
        }
      }, 30000);

      // Cleanup only when the app truly unmounts (not on navigation)
      // We use the cleanup function more carefully
      return () => {
        clearInterval(heartbeatInterval);
        // Don't disconnect on cleanup - keep connection alive
        // The socket will be cleaned up when the user logs out or closes the browser
        initializedRef.current = false;
      };
    }

    // If socket exists but we haven't set state yet
    if (globalSocket) {
      socketRef.current = globalSocket;
      setIsConnected(globalSocket.connected);
      globalSocket.off('logout_device', handleLogoutDevice);
      globalSocket.on('logout_device', handleLogoutDevice);
    }
  }, [userId, enabled, handleLogoutDevice]);

  return (
    <DeviceSocketContext.Provider
      value={{ isConnected, socket: socketRef.current }}
    >
      {children}
    </DeviceSocketContext.Provider>
  );
}

/**
 * Hook to access the device socket context.
 */
export function useDeviceSocket() {
  return useContext(DeviceSocketContext);
}

/**
 * Hook that returns whether the device socket is connected.
 */
export function useDeviceSocketConnected() {
  const { isConnected } = useDeviceSocket();
  return isConnected;
}

/**
 * Disconnect the global socket (call on explicit logout)
 */
export function disconnectDeviceSocket() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    globalUserId = null;
    globalFingerprint = null;
  }
}
