'use client';

import { Box } from '@mui/material';
import SupportChat from './components/support-chat';

/**
 * Dealer Support Chat Page
 * Allows dealers to chat with admins for CRM support
 */
export default function SupportPage() {
  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 81px)', // Account for topbar + padding
      }}
    >
      <SupportChat />
    </Box>
  );
}
