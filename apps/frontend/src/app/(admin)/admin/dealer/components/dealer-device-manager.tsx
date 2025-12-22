'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DevicesIcon from '@mui/icons-material/Devices';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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

export default function DealerDeviceManager({
  dealerId,
  dealerName,
  open,
  onClose,
}: DealerDeviceManagerProps) {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDevices = async () => {
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
  };

  const handleDeleteDevice = async (deviceId: number) => {
    try {
      setDeleting(true);

      const response = await fetch(
        `/api/admin/dealers/${dealerId}/devices/${deviceId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to revoke device');
      }

      // Refresh the list
      await fetchDevices();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke device');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (open && dealerId) {
      fetchDevices();
    }
  }, [open, dealerId]);

  const activeDevices = devices.filter((d) => d.isActive);
  const inactiveDevices = devices.filter((d) => !d.isActive);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
            <Alert severity="error" sx={{ mb: 2 }}>
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
                      <TableCell align="right">Action</TableCell>
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
                          <Tooltip title="Revoke Device Access">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => setDeleteConfirm(device.id)}
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inactiveDevices.map((device) => (
                          <TableRow key={device.id} sx={{ opacity: 0.6 }}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>Revoke Device Access?</DialogTitle>
        <DialogContent>
          <Typography>
            This will immediately log out this device and free up a device slot.
            The user will need to log in again from an available slot.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteConfirm && handleDeleteDevice(deleteConfirm)}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
