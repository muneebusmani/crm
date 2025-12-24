'use client';

import { DeviceSocketProvider } from '@/contexts/DeviceSocketContext';
import { useEffect, useState } from 'react';

interface DeviceSessionWrapperProps {
  children: React.ReactNode;
  userId?: string | number;
}

/**
 * Client-side wrapper that provides device session management.
 * This component:
 * - Connects to WebSocket for real-time device revocation
 * - Listens for logout_device events and triggers force logout
 *
 * Add this to authenticated layouts (dealer, admin) to enable
 * instant logout when a device is revoked.
 */
export function DeviceSessionWrapper({
  children,
  userId,
}: DeviceSessionWrapperProps) {
  const [parsedUserId, setParsedUserId] = useState<number | undefined>();

  useEffect(() => {
    // Parse userId from string (from cookie) to number
    if (userId) {
      const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (!Number.isNaN(id)) {
        setParsedUserId(id);
      }
    }
  }, [userId]);

  return (
    <DeviceSocketProvider userId={parsedUserId} enabled={!!parsedUserId}>
      {children}
    </DeviceSocketProvider>
  );
}
