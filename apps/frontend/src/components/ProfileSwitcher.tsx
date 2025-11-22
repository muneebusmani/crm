'use client';

import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  AccountCircle,
  Person,
  SwapHoriz,
  Settings,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { selectProfileAction } from '@/actions/selectProfileAction';

interface ProfileSwitcherProps {
  currentProfileName?: string;
  currentProfileEmail?: string;
}

export default function ProfileSwitcher({
  currentProfileName,
  currentProfileEmail,
}: ProfileSwitcherProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchProfile = () => {
    handleClose();
    router.push('/dealer/select-profile');
  };

  const handleManageProfiles = () => {
    handleClose();
    router.push('/dealer/profiles');
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        edge="end"
        aria-label="profile menu"
        aria-controls="profile-menu"
        aria-haspopup="true"
        color="inherit"
      >
        <AccountCircle />
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 250 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Current Profile
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {currentProfileName || 'No profile selected'}
          </Typography>
          {currentProfileEmail && (
            <Typography variant="caption" color="text.secondary">
              {currentProfileEmail}
            </Typography>
          )}
        </Box>

        <Divider />

        <MenuItem onClick={handleSwitchProfile}>
          <ListItemIcon>
            <SwapHoriz fontSize="small" />
          </ListItemIcon>
          <ListItemText>Switch Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleManageProfiles}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Profiles</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
