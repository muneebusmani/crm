'use client';
import { Box, Typography } from '@mui/material';
import type { JSX } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: <no reason>
const Footer = ({ theme }: { theme: any }): JSX.Element => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="caption" color={theme.palette.text.secondary}>
        2025 © Engine Finders.
      </Typography>
      <Typography variant="caption" color={theme.palette.text.secondary}>
        Design & Develop by Xytrix Solutions
      </Typography>
    </Box>
  );
};

export default Footer;
