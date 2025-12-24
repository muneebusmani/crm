'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DevicesIcon from '@mui/icons-material/Devices';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface UserDevice {
  id: number;
  deviceFingerprint: string;
  platform: 'web' | 'android' | 'ios';
  deviceName: string | null;
  ipAddress: string | null;
  location: string | null;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

interface DealerDeviceManagerProps {
  dealerId: number;
  dealerName: string;
  open: boolean;
  onClose: () => void;
}

type ActionType = 'revoke' | 'reactivate' | 'remove';

interface ConfirmState {
  deviceId: number;
  action: ActionType;
  deviceName: string;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'android':
      return <PhoneAndroidIcon />;
    case 'ios':
      return <PhoneIphoneIcon />;
    default:
      return <ComputerIcon />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const ACTION_LABELS: Record<
  ActionType,
  {
    title: string;
    description: string;
    buttonText: string;
    color: 'error' | 'success' | 'warning';
  }
> = {
  revoke: {
    title: 'Revoke Device Access?',
    description:
      'This will immediately log out this device. The device record is preserved and can be reactivated later.',
    buttonText: 'Revoke',
    color: 'warning',
  },
  reactivate: {
    title: 'Reactivate Device?',
    description:
      'This will allow the user to log in from this device again without using a new device slot.',
    buttonText: 'Reactivate',
    color: 'success',
  },
  remove: {
    title: 'Remove Device Permanently?',
    description:
      'This will permanently delete the device record and free up a device slot. This action cannot be undone.',
    buttonText: 'Remove',
    color: 'error',
  },
};

export default function DealerDeviceManager({
  dealerId,
  dealerName,
  open,
  onClose,
}: DealerDeviceManagerProps) {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement;
    device: UserDevice;
  } | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/dealers/${dealerId}/devices`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      const data = await response.json();
      setDevices(data.data || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  const handleDeviceAction = async (deviceId: number, action: ActionType) => {
    try {
      setActionLoading(true);
      setError(null);

      let response: Response;

      if (action === 'remove') {
        response = await fetch(
          `/api/admin/dealers/${dealerId}/devices/${deviceId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );
      } else {
        response = await fetch(
          `/api/admin/dealers/${dealerId}/devices/${deviceId}`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
          },
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${action} device`);
      }

      await fetchDevices();
      setConfirmState(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${action} device`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmDialog = (device: UserDevice, action: ActionType) => {
    setMenuAnchor(null);
    setConfirmState({
      deviceId: device.id,
      action,
      deviceName: device.deviceName || 'Unknown Device',
    });
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    device: UserDevice,
  ) => {
    setMenuAnchor({ element: event.currentTarget, device });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  useEffect(() => {
    if (open && dealerId) {
      fetchDevices();
    }
  }, [open, dealerId, fetchDevices]);

  const activeDevices = devices.filter((d) => d.isActive);
  const inactiveDevices = devices.filter((d) => !d.isActive);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <DevicesIcon />
              <Typography variant="h6">
                Device Management - {dealerName}
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchDevices} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : devices.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No devices registered for this dealer.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Active Devices */}
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Active Devices ({activeDevices.length})
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>Device</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeDevices.map((device) => (
                      <TableRow key={device.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getPlatformIcon(device.platform)}
                            <Chip
                              label={device.platform.toUpperCase()}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={device.deviceFingerprint || ''}>
                            <Typography variant="body2" sx={{ cursor: 'help' }}>
                              {device.deviceName || 'Unknown Device'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {device.location ? (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationOnIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {device.location}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {device.ipAddress || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(device.lastLoginAt)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Revoke (Logout)">
                            <IconButton
                              color="warning"
                              size="small"
                              onClick={() =>
                                openConfirmDialog(device, 'revoke')
                              }
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Permanently">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                openConfirmDialog(device, 'remove')
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {activeDevices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">
                            No active devices
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Inactive/Revoked Devices */}
              {inactiveDevices.length > 0 && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}
                  >
                    Revoked Devices ({inactiveDevices.length})
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Platform</TableCell>
                          <TableCell>Device</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Last Login</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inactiveDevices.map((device) => (
                          <TableRow key={device.id} sx={{ opacity: 0.7 }}>
                            <TableCell>
                              {getPlatformIcon(device.platform)}
                            </TableCell>
                            <TableCell>
                              {device.deviceName || 'Unknown Device'}
                            </TableCell>
                            <TableCell>{device.location || '—'}</TableCell>
                            <TableCell>
                              {formatDate(device.lastLoginAt)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="Revoked"
                                size="small"
                                color="default"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, device)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu for Revoked Devices */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            menuAnchor && openConfirmDialog(menuAnchor.device, 'reactivate')
          }
        >
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText>Reactivate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            menuAnchor && openConfirmDialog(menuAnchor.device, 'remove')
          }
        >
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText>Remove Permanently</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmState !== null}
        onClose={() => setConfirmState(null)}
      >
        {confirmState && (
          <>
            <DialogTitle>
              {ACTION_LABELS[confirmState.action].title}
            </DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                <strong>Device:</strong> {confirmState.deviceName}
              </Typography>
              <Typography color="text.secondary">
                {ACTION_LABELS[confirmState.action].description}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setConfirmState(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleDeviceAction(confirmState.deviceId, confirmState.action)
                }
                color={ACTION_LABELS[confirmState.action].color}
                variant="contained"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  ACTION_LABELS[confirmState.action].buttonText
                )}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
