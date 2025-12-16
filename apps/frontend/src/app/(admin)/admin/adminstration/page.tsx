'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import { get, post, put } from '@/lib/api';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  AccountBalanceWallet as CreditIcon,
} from '@mui/icons-material';
import type { Lead } from '@crm/types';

interface HqLeadSetting {
  id: number;
  packageTier: string;
  dailyLimit: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DealerHqStatus {
  dealerId: number;
  dealerName: string;
  tierName: string;
  tierQuota: number;
  customQuota: number | null;
  effectiveQuota: number;
  assignedToday: number;
  canReceiveMore: boolean;
}

const TAB_KEYS = {
  QUOTAS: 'quotas',
  ASSIGNMENT: 'assignment',
  CREDITS: 'credits',
  LEGACY: 'legacy',
} as const;

interface DealerCreditStatus {
  dealerId: number;
  dealerName: string;
  tierName: string;
  currentCredit: number;
  creditLimit: number;
  lastResetAt: string | null;
}

const HqLeadsAdminPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || TAB_KEYS.QUOTAS;

  const getTabIndex = (tab: string) => {
    switch (tab) {
      case TAB_KEYS.QUOTAS:
        return 0;
      case TAB_KEYS.ASSIGNMENT:
        return 1;
      case TAB_KEYS.CREDITS:
        return 2;
      case TAB_KEYS.LEGACY:
        return 3;
      default:
        return 0;
    }
  };

  const [activeTab, setActiveTab] = useState(getTabIndex(tabParam));
  const [settings, setSettings] = useState<HqLeadSetting[]>([]);
  const [editingSetting, setEditingSetting] = useState<HqLeadSetting | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const [unassignedHqLeads, setUnassignedHqLeads] = useState<Lead[]>([]);
  const [dealerHqStatuses, setDealerHqStatuses] = useState<DealerHqStatus[]>(
    [],
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(
    null,
  );
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [editingDealerLimit, setEditingDealerLimit] = useState<{
    dealerId: number;
    limit: number;
  } | null>(null);

  const [leadIdToAssign, setLeadIdToAssign] = useState('');
  const [dealerIdToAssign, setDealerIdToAssign] = useState('');

  // Handle tab change with query params
  // Credit state
  const [creditStatuses, setCreditStatuses] = useState<DealerCreditStatus[]>(
    [],
  );
  const [creditLoading, setCreditLoading] = useState(false);
  const [resettingDealerId, setResettingDealerId] = useState<number | null>(
    null,
  );
  const [resettingAll, setResettingAll] = useState(false);

  // Handle tab change with query params
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const tabKey =
      newValue === 0
        ? TAB_KEYS.QUOTAS
        : newValue === 1
          ? TAB_KEYS.ASSIGNMENT
          : newValue === 2
            ? TAB_KEYS.CREDITS
            : TAB_KEYS.LEGACY;
    router.push(`/admin/adminstration?tab=${tabKey}`);
  };

  const fetchHqLeadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/admin/hq-leads/settings');
      setSettings(response);
    } catch (error) {
      console.error('Error fetching HQ lead settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnassignedHqLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/admin/hq-leads/unassigned');
      setUnassignedHqLeads(response.data || response);
    } catch (error) {
      console.error('Error fetching unassigned HQ leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDealerHqStatuses = useCallback(async () => {
    try {
      const response = await get('/admin/hq-leads/dealers');
      setDealerHqStatuses(response.data || response);
    } catch (error) {
      console.error('Error fetching dealer HQ statuses:', error);
    }
  }, []);

  const fetchCreditStatuses = useCallback(async () => {
    setCreditLoading(true);
    try {
      const response = await get('/dealer-tiers/credits/status');
      setCreditStatuses(response.data || response || []);
    } catch (error) {
      console.error('Error fetching credit statuses:', error);
    } finally {
      setCreditLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      fetchDealerHqStatuses();
    } else if (activeTab === 1) {
      fetchUnassignedHqLeads();
      fetchDealerHqStatuses();
    } else if (activeTab === 2) {
      fetchCreditStatuses();
    } else if (activeTab === 3) {
      fetchHqLeadSettings();
    }
  }, [
    activeTab,
    fetchHqLeadSettings,
    fetchUnassignedHqLeads,
    fetchDealerHqStatuses,
    fetchCreditStatuses,
  ]);

  const handleCreateSetting = async () => {
    if (!editingSetting) return;
    try {
      await post('/admin/hq-leads/settings', editingSetting);
      setIsAdding(false);
      setEditingSetting(null);
      fetchHqLeadSettings();
    } catch (error) {
      console.error('Error creating HQ lead setting:', error);
    }
  };

  const handleUpdateSetting = async () => {
    if (!editingSetting) return;

    try {
      await put(`/admin/hq-leads/settings/${editingSetting.packageTier}`, {
        packageTier: editingSetting.packageTier,
        dailyLimit: editingSetting.dailyLimit,
        isActive: editingSetting.isActive,
      });
      setEditingSetting(null);
      fetchHqLeadSettings();
    } catch (error) {
      console.error('Error updating HQ lead setting:', error);
    }
  };

  const handleResetQuota = async (dealerId: number) => {
    try {
      await post(`/admin/hq-leads/reset-quota/${dealerId}`);
      alert(`Dealer ${dealerId}'s quota reset successfully`);
      fetchDealerHqStatuses();
    } catch (error) {
      console.error('Error resetting dealer quota:', error);
    }
  };

  const handleAssignLead = async () => {
    const leadId = parseInt(leadIdToAssign, 10);
    const dealerId = parseInt(dealerIdToAssign, 10);

    if (Number.isNaN(leadId) || Number.isNaN(dealerId)) {
      alert('Please enter a valid Lead ID and Dealer ID.');
      return;
    }
    try {
      await post(`/admin/hq-leads/assign/${leadId}/to/${dealerId}`);
      alert('HQ Lead assigned successfully');
      setLeadIdToAssign('');
      setDealerIdToAssign('');
      fetchUnassignedHqLeads();
      fetchDealerHqStatuses();
    } catch (error) {
      console.error('Error assigning HQ lead:', error);
    }
  };

  const handleOpenAssignDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedDealerId(null);
    setAssignmentSuccess(null);
    setAssignmentError(null);
    setAssignDialogOpen(true);
  };

  const handleAssignFromDialog = async () => {
    if (!selectedLead || !selectedDealerId) return;

    try {
      await post(
        `/admin/hq-leads/assign/${selectedLead.id}/to/${selectedDealerId}`,
      );
      setAssignmentSuccess(`Successfully assigned lead to dealer!`);
      setAssignmentError(null);
      fetchUnassignedHqLeads();
      fetchDealerHqStatuses();
      setTimeout(() => {
        setAssignDialogOpen(false);
        setSelectedLead(null);
        setSelectedDealerId(null);
      }, 1500);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      setAssignmentError(
        message ||
          'Failed to assign lead. Dealer may have reached their daily limit.',
      );
      setAssignmentSuccess(null);
    }
  };

  const handleUpdateDealerLimit = async (
    dealerId: number,
    newLimit: number,
  ) => {
    try {
      await put(`/admin/hq-leads/dealers/${dealerId}/limit`, {
        dailyLimit: newLimit,
      });
      setEditingDealerLimit(null);
      fetchDealerHqStatuses();
    } catch (error) {
      console.error('Error updating dealer limit:', error);
      alert('Failed to update dealer limit');
    }
  };

  const handleAddNewClick = () => {
    const newEmptySetting: HqLeadSetting = {
      id: -1,
      packageTier: '',
      dailyLimit: 0,
      isActive: true,
    };
    setIsAdding(true);
    setEditingSetting(newEmptySetting);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setEditingSetting(null);
  };

  // Credit reset handlers
  const handleResetDealerCredits = async (dealerId: number) => {
    setResettingDealerId(dealerId);
    try {
      await post(`/dealer-tiers/credits/reset/${dealerId}`);
      alert(`Credits reset successfully for dealer ${dealerId}`);
      fetchCreditStatuses();
    } catch (error) {
      console.error('Error resetting dealer credits:', error);
      alert('Failed to reset dealer credits');
    } finally {
      setResettingDealerId(null);
    }
  };

  const handleResetAllCredits = async () => {
    if (
      !confirm(
        'Are you sure you want to reset credits for ALL dealers? This action cannot be undone.',
      )
    ) {
      return;
    }
    setResettingAll(true);
    try {
      const result = (await post('/dealer-tiers/credits/reset-all')) as {
        resetCount?: number;
      };
      alert(
        `Credits reset successfully for ${result.resetCount || 'all'} dealers`,
      );
      fetchCreditStatuses();
    } catch (error) {
      console.error('Error resetting all credits:', error);
      alert('Failed to reset all credits');
    } finally {
      setResettingAll(false);
    }
  };

  const renderContent = (children: React.ReactNode) => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    return children;
  };

  // TAB 1: Dealer Quotas Management
  const renderQuotasContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Dealer HQ Lead Quotas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage tier-based quotas and custom overrides for each dealer.
                Quotas reset daily at midnight.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={async () => {
                if (
                  !confirm(
                    'Run backfill now? This will assign all missed HQ leads to eligible dealers.',
                  )
                ) {
                  return;
                }
                try {
                  const response = await fetch('/api/admin/hq-leads/backfill', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Backfill failed');
                  }

                  const result = await response.json();
                  alert(
                    `Backfill complete!\\n\\nLeads assigned: ${result.totalLeadsAssigned}\\nDealers processed: ${result.dealersProcessed}`,
                  );

                  await fetchDealerHqStatuses();
                } catch (error) {
                  console.error('Error running backfill:', error);
                  alert(
                    'Error running backfill: ' +
                      (error instanceof Error
                        ? error.message
                        : 'Unknown error'),
                  );
                }
              }}
            >
              Run Backfill Now
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Automatic Backfill:</strong> Runs daily at 1:00 AM UK time
              to assign missed leads.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Quota Rules:</strong> Gold = Unlimited, Silver = 10/day,
              Bronze = 5/day. Custom overrides take priority.
            </Typography>
          </Alert>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: (theme) => theme.palette.primary.main,
                  }}
                >
                  <TableCell
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Dealer</strong>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Tier</strong>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Tier Quota</strong>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Custom Override</strong>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Effective</strong>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Assigned Today</strong>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: (theme) => theme.palette.primary.contrastText,
                    }}
                  >
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dealerHqStatuses.map((dealer) => (
                  <TableRow key={dealer.dealerId} hover>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {dealer.dealerName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={dealer.tierName}
                        size="small"
                        color={
                          dealer.tierName === 'Gold'
                            ? 'warning'
                            : dealer.tierName === 'Silver'
                              ? 'default'
                              : 'primary'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {dealer.tierQuota === -1 ? '∞' : dealer.tierQuota}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {editingDealerLimit?.dealerId === dealer.dealerId ? (
                        <TextField
                          type="number"
                          size="small"
                          value={editingDealerLimit.limit}
                          onChange={(e) =>
                            setEditingDealerLimit({
                              ...editingDealerLimit,
                              limit: parseInt(e.target.value, 10),
                            })
                          }
                          sx={{ width: 80 }}
                          inputProps={{ min: -1 }}
                          placeholder="NULL"
                        />
                      ) : dealer.customQuota === null ? (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      ) : (
                        <Chip
                          label={
                            dealer.customQuota === -1 ? '∞' : dealer.customQuota
                          }
                          size="small"
                          color="info"
                          variant="filled"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          dealer.effectiveQuota === -1
                            ? '∞ Unlimited'
                            : dealer.effectiveQuota
                        }
                        size="small"
                        color={
                          dealer.effectiveQuota === -1
                            ? 'success'
                            : dealer.effectiveQuota === 0
                              ? 'default'
                              : 'primary'
                        }
                        variant={
                          dealer.effectiveQuota === 0 ? 'outlined' : 'filled'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {dealer.assignedToday}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {dealer.canReceiveMore ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Available"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<WarningIcon />}
                          label="At Limit"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingDealerLimit?.dealerId === dealer.dealerId ? (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'center',
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleUpdateDealerLimit(
                                dealer.dealerId,
                                editingDealerLimit.limit,
                              )
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setEditingDealerLimit(null)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'center',
                          }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              setEditingDealerLimit({
                                dealerId: dealer.dealerId,
                                limit: dealer.customQuota ?? dealer.tierQuota,
                              })
                            }
                          >
                            Override
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleResetQuota(dealer.dealerId)}
                          >
                            Reset
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  // TAB 2: Manual Assignment
  const renderAssignmentContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Unassigned HQ Leads</Typography>
              <Typography variant="body2" color="text.secondary">
                {unassignedHqLeads.length} leads waiting for assignment
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                fetchUnassignedHqLeads();
                fetchDealerHqStatuses();
              }}
              title="Refresh"
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          {unassignedHqLeads.length === 0 ? (
            <Alert severity="success">
              All HQ leads have been assigned! 🎉
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: (theme) => theme.palette.primary.main,
                    }}
                  >
                    <TableCell
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>ID</strong>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Customer</strong>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Contact</strong>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Vehicle</strong>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Description</strong>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Received</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unassignedHqLeads.map((lead) => (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Chip
                          label={`#${lead.id}`}
                          size="small"
                          color="warning"
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {lead.name || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                          }}
                        >
                          {lead.email && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <EmailIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {lead.email}
                              </Typography>
                            </Box>
                          )}
                          {lead.number && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {lead.number}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <CarIcon fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {lead.vehicle_brand || ''}{' '}
                              {lead.vehicle_model || lead.vehicle_series || ''}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {lead.vehicle_vrm || lead.vehicle_reg || 'No VRM'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={lead.description || 'No description'}>
                          <Typography
                            variant="caption"
                            sx={{
                              maxWidth: 200,
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {lead.description || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {lead.createdAt
                            ? new Date(
                                lead.createdAt as unknown as string,
                              ).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleOpenAssignDialog(lead)}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Manual Override */}
      <Card sx={{ opacity: 0.7 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Manual Override (Advanced)
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAssignLead();
            }}
            sx={{ display: 'flex', gap: 2, mt: 1 }}
          >
            <TextField
              label="Lead ID"
              type="number"
              value={leadIdToAssign}
              onChange={(e) => setLeadIdToAssign(e.target.value)}
              size="small"
              sx={{ width: 120 }}
            />
            <TextField
              label="Dealer ID"
              type="number"
              value={dealerIdToAssign}
              onChange={(e) => setDealerIdToAssign(e.target.value)}
              size="small"
              sx={{ width: 120 }}
            />
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              size="small"
            >
              Assign
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // TAB 3: Monthly Credits Management
  const renderCreditsContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditIcon color="primary" />
              <Typography variant="h6">Dealer Monthly Credits</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh credit data">
                <IconButton
                  onClick={fetchCreditStatuses}
                  disabled={creditLoading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="warning"
                onClick={handleResetAllCredits}
                disabled={resettingAll}
                startIcon={
                  resettingAll ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshIcon />
                  )
                }
              >
                {resettingAll ? 'Resetting...' : 'Reset All Credits'}
              </Button>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Credits are automatically reset on the{' '}
              <strong>1st of each month at midnight</strong>. Use the reset
              buttons below for manual resets when needed.
            </Typography>
          </Alert>

          {creditLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: (theme) => theme.palette.primary.main,
                    }}
                  >
                    <TableCell
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Dealer</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Tier</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Current Credits</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Credit Limit</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Last Reset</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    >
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditStatuses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={2}>
                          No dealer credit data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    creditStatuses.map((dealer) => (
                      <TableRow key={dealer.dealerId} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {dealer.dealerName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dealer.tierName}
                            size="small"
                            color={
                              dealer.tierName === 'Gold'
                                ? 'warning'
                                : dealer.tierName === 'Silver'
                                  ? 'default'
                                  : 'primary'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dealer.currentCredit}
                            size="small"
                            color={
                              dealer.currentCredit <= 10
                                ? 'error'
                                : dealer.currentCredit <= 50
                                  ? 'warning'
                                  : 'success'
                            }
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {dealer.creditLimit}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" color="text.secondary">
                            {dealer.lastResetAt
                              ? new Date(
                                  dealer.lastResetAt,
                                ).toLocaleDateString()
                              : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() =>
                              handleResetDealerCredits(dealer.dealerId)
                            }
                            disabled={resettingDealerId === dealer.dealerId}
                            startIcon={
                              resettingDealerId === dealer.dealerId ? (
                                <CircularProgress size={14} />
                              ) : (
                                <RefreshIcon fontSize="small" />
                              )
                            }
                          >
                            {resettingDealerId === dealer.dealerId
                              ? 'Resetting...'
                              : 'Reset'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  // TAB 4: Legacy Settings
  const renderLegacyContent = () => (
    <Card>
      <CardContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Legacy System:</strong> This tier-based system is being
            replaced by the new dealer-specific quotas. Use the "Dealer Quotas"
            tab for modern quota management.
          </Typography>
        </Alert>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Package Tier Settings</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNewClick}
            disabled={isAdding}
          >
            Add New
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Package</TableCell>
                <TableCell>Daily Limit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isAdding && editingSetting && (
                <TableRow>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Tier</InputLabel>
                      <Select
                        value={editingSetting.packageTier}
                        label="Tier"
                        onChange={(e) =>
                          setEditingSetting({
                            ...editingSetting,
                            packageTier: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="Bronze">Bronze</MenuItem>
                        <MenuItem value="Silver">Silver</MenuItem>
                        <MenuItem value="Gold">Gold</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      label="Limit"
                      size="small"
                      value={editingSetting.dailyLimit}
                      onChange={(e) =>
                        setEditingSetting({
                          ...editingSetting,
                          dailyLimit: parseInt(e.target.value, 10) || 0,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={editingSetting.isActive}
                      onChange={(e) =>
                        setEditingSetting({
                          ...editingSetting,
                          isActive: e.target.checked,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleCreateSetting}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button size="small" onClick={handleCancelAdd}>
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>{setting.packageTier}</TableCell>
                  <TableCell>
                    {editingSetting?.id === setting.id ? (
                      <TextField
                        type="number"
                        value={editingSetting.dailyLimit}
                        onChange={(e) =>
                          setEditingSetting({
                            ...editingSetting,
                            dailyLimit: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        size="small"
                      />
                    ) : setting.dailyLimit === -1 ? (
                      'Unlimited'
                    ) : (
                      setting.dailyLimit
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={
                        editingSetting?.id === setting.id
                          ? editingSetting.isActive
                          : setting.isActive
                      }
                      onChange={async (e) => {
                        const newIsActive = e.target.checked;
                        if (editingSetting?.id === setting.id) {
                          setEditingSetting({
                            ...editingSetting,
                            isActive: newIsActive,
                          });
                        } else {
                          const updatedSetting = {
                            ...setting,
                            isActive: newIsActive,
                          };
                          try {
                            await put(
                              `/admin/hq-leads/settings/${setting.packageTier}`,
                              updatedSetting,
                            );
                            fetchHqLeadSettings();
                          } catch (error) {
                            console.error('Error updating setting:', error);
                          }
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {editingSetting?.id === setting.id ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleUpdateSetting}
                          sx={{ mr: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setEditingSetting(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => setEditingSetting(setting)}
                        disabled={isAdding}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  // Assignment Dialog
  const renderAssignmentDialog = () => (
    <Dialog
      open={assignDialogOpen}
      onClose={() => setAssignDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          Assign HQ Lead to Dealer
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedLead && (
          <Box sx={{ mt: 2 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.background.paper
                    : theme.palette.warning.light,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Lead Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedLead.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography variant="body2">
                    {selectedLead.email || selectedLead.number || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Vehicle
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedLead.vehicle_brand}{' '}
                    {selectedLead.vehicle_model || selectedLead.vehicle_series}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    VRM
                  </Typography>
                  <Typography variant="body2">
                    {selectedLead.vehicle_vrm ||
                      selectedLead.vehicle_reg ||
                      'N/A'}
                  </Typography>
                </Grid>
                {selectedLead.description && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedLead.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            <Typography variant="subtitle2" gutterBottom>
              Select Dealer to Assign
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Choose Dealer</InputLabel>
              <Select
                value={selectedDealerId || ''}
                label="Choose Dealer"
                onChange={(e) => setSelectedDealerId(e.target.value as number)}
              >
                {dealerHqStatuses
                  .filter((d) => d.canReceiveMore)
                  .map((dealer) => (
                    <MenuItem key={dealer.dealerId} value={dealer.dealerId}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        <Typography>{dealer.dealerName}</Typography>
                        <Chip
                          label={`${dealer.assignedToday}/${dealer.effectiveQuota === -1 ? '∞' : dealer.effectiveQuota}`}
                          size="small"
                          color="success"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                <Divider />
                {dealerHqStatuses
                  .filter((d) => !d.canReceiveMore)
                  .map((dealer) => (
                    <MenuItem
                      key={dealer.dealerId}
                      value={dealer.dealerId}
                      disabled
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        <Typography color="text.secondary">
                          {dealer.dealerName}
                        </Typography>
                        <Chip
                          label={`At Limit (${dealer.assignedToday}/${dealer.effectiveQuota})`}
                          size="small"
                          color="warning"
                        />
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {selectedDealerId && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? theme.palette.background.paper
                      : theme.palette.success.light,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Selected Dealer
                </Typography>
                {(() => {
                  const dealer = dealerHqStatuses.find(
                    (d) => d.dealerId === selectedDealerId,
                  );
                  if (!dealer) return null;
                  return (
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {dealer.dealerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Quota: {dealer.assignedToday} /{' '}
                        {dealer.effectiveQuota === -1
                          ? 'Unlimited'
                          : dealer.effectiveQuota}{' '}
                        today
                      </Typography>
                    </Box>
                  );
                })()}
              </Paper>
            )}

            {assignmentSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {assignmentSuccess}
              </Alert>
            )}
            {assignmentError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {assignmentError}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAssignFromDialog}
          disabled={!selectedDealerId || !!assignmentSuccess}
        >
          Assign Lead
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        HQ Leads Administration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage dealer quotas, assign leads, and configure HQ lead distribution
        settings.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Dealer Quotas & Backfill" />
        <Tab label="Manual Assignment" />
        <Tab label="Monthly Credits" />
        <Tab label="Legacy Settings" />
      </Tabs>

      {activeTab === 0 && renderContent(renderQuotasContent())}
      {activeTab === 1 && renderContent(renderAssignmentContent())}
      {activeTab === 2 && renderContent(renderCreditsContent())}
      {activeTab === 3 && renderContent(renderLegacyContent())}

      {renderAssignmentDialog()}
    </Box>
  );
};

export default HqLeadsAdminPage;
