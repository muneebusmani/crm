'use client';

import { Box, Typography, useTheme, Skeleton, Divider } from '@mui/material';
import {
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium,
  AccountBalance,
} from '@mui/icons-material';

interface DealerTopbarProps {
  tierName?: string;
  credits?: number;
  dealerName?: string;
  dealerEmail?: string;
  loading?: boolean;
}

const DealerTopbar: React.FC<DealerTopbarProps> = ({
  tierName,
  credits,
  dealerName,
  dealerEmail,
  loading = false,
}) => {
  const theme = useTheme();

  // Get tier color and icon
  const getTierStyle = () => {
    const lowerTier = tierName?.toLowerCase() || '';
    if (lowerTier.includes('gold')) {
      return {
        color: '#FFD700',
        icon: <EmojiEvents sx={{ fontSize: 18 }} />,
        label: 'Gold',
      };
    }
    if (lowerTier.includes('silver')) {
      return {
        color: '#C0C0C0',
        icon: <MilitaryTech sx={{ fontSize: 18 }} />,
        label: 'Silver',
      };
    }
    if (lowerTier.includes('bronze')) {
      return {
        color: '#CD7F32',
        icon: <WorkspacePremium sx={{ fontSize: 18 }} />,
        label: 'Bronze',
      };
    }
    return {
      color: theme.palette.grey[500],
      icon: null,
      label: 'N/A',
    };
  };

  const tierStyle = getTierStyle();

  // Get credits color based on amount
  const getCreditsColor = () => {
    if (!credits) return theme.palette.grey[500];
    if (credits < 100) return theme.palette.error.main;
    if (credits < 300) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 56,
        }}
      >
        <Skeleton variant="rectangular" width={200} height={32} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        px: 3,
        py: 1.5,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        minHeight: 64,
        gap: 0,
      }}
    >
      {/* Tier Card */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1,
          minWidth: 120,
          height: '100%',
        }}
      >
        {tierStyle.icon && (
          <Box sx={{ color: tierStyle.color, display: 'flex' }}>
            {tierStyle.icon}
          </Box>
        )}
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.7rem',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Tier
          </Typography>
          <Typography
            variant="body2"
            fontWeight="700"
            sx={{
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
              lineHeight: 1.2,
            }}
          >
            {tierStyle.label}
          </Typography>
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Credits Card */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1,
          minWidth: 120,
          height: '100%',
        }}
      >
        <AccountBalance sx={{ fontSize: 20, color: getCreditsColor() }} />
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.7rem',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Credits
          </Typography>
          <Typography
            variant="body2"
            fontWeight="700"
            sx={{
              color: getCreditsColor(),
              fontSize: '0.875rem',
              lineHeight: 1.2,
            }}
          >
            {credits ?? 0}
          </Typography>
        </Box>
      </Box>
      {/* Dealer Info Card */}
      <Divider orientation="vertical" flexItem />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          height: '100%',
        }}
      >
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="body2"
            fontWeight="600"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
              display: 'inline',
            }}
          >
            {dealerName || 'Dealer'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.palette.primary.contrastText,
            fontWeight: 'bold',
            fontSize: '1rem',
            flexShrink: 0,
          }}
        >
          {dealerName?.charAt(0).toUpperCase() || 'D'}
        </Box>
      </Box>
    </Box>
  );
};

export default DealerTopbar;
