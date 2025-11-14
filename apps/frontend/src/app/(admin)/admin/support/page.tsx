'use client';

import { Box } from '@mui/material';
import AdminSupportChat from './components/admin-support-chat';

/**
 * Admin Support Dashboard Page
 * Allows admins to view and respond to dealer support queries
 */
export default function AdminSupportPage() {
  return (
    <Box sx={{ height: '100vh' }}>
      <AdminSupportChat />
    </Box>
  );
}
