'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  dailyHqLeadLimit: number;
  assignedToday: number;
  canReceiveMore: boolean;
}

interface DealerStatus {
  id: number;
  name: string;
  email: string;
  status: string;
  packageTier: string;
  assignedCount: number;
  dailyLimit: number;
}

const HqLeadsAdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState<HqLeadSetting[]>([]);
  const [editingSetting, setEditingSetting] = useState<HqLeadSetting | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const [dealerStatuses, setDealerStatuses] = useState<DealerStatus[]>([]);
  
  // New states for improved HQ lead management
  const [unassignedHqLeads, setUnassignedHqLeads] = useState<Lead[]>([]);
  const [dealerHqStatuses, setDealerHqStatuses] = useState<DealerHqStatus[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [editingDealerLimit, setEditingDealerLimit] = useState<{ dealerId: number; limit: number } | null>(null);

  const [leadIdToAssign, setLeadIdToAssign] = useState('');
  const [dealerIdToAssign, setDealerIdToAssign] = useState('');

  const fetchHqLeadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/admin/hq-leads/settings');
      // WARN: Don't change response structure here, it is used in other places, this works perfectly according to the helpers
      setSettings(response);
    } catch (error) {
      console.error('Error fetching HQ lead settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDealerStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/admins/dealers-status');
      setDealerStatuses(response.data);
    } catch (error) {
      console.error('Error fetching dealer statuses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unassigned HQ leads (leads marked as HQ but not yet assigned)
  const fetchUnassignedHqLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/admin/leads');
      const allLeads = response.data || response;
      // Filter to only HQ leads that are not assigned
      const unassigned = allLeads.filter((lead: Lead) => 
        lead.isHqLead && (!lead.assigned_to || lead.assigned_to === '' || lead.assigned_to === null)
      );
      setUnassignedHqLeads(unassigned);
    } catch (error) {
      console.error('Error fetching unassigned HQ leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dealer HQ statuses (with per-dealer limits)
  const fetchDealerHqStatuses = useCallback(async () => {
    try {
      const response = await get('/admin/hq-leads/dealers');
      setDealerHqStatuses(response.data || response);
    } catch (error) {
      console.error('Error fetching dealer HQ statuses:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      fetchHqLeadSettings();
    } else if (activeTab === 1) {
      fetchDealerStatuses();
    } else if (activeTab === 2) {
      fetchUnassignedHqLeads();
      fetchDealerHqStatuses();
    }
  }, [activeTab, fetchHqLeadSettings, fetchDealerStatuses, fetchUnassignedHqLeads, fetchDealerHqStatuses]);

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
      fetchDealerStatuses(); // Refresh the list
      fetchDealerHqStatuses(); // Also refresh HQ statuses
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

  // Open assign dialog with selected lead
  const handleOpenAssignDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedDealerId(null);
    setAssignmentSuccess(null);
    setAssignmentError(null);
    setAssignDialogOpen(true);
  };

  // Handle assignment from dialog
  const handleAssignFromDialog = async () => {
    if (!selectedLead || !selectedDealerId) return;
    
    try {
      await post(`/admin/hq-leads/assign/${selectedLead.id}/to/${selectedDealerId}`);
      setAssignmentSuccess(`Successfully assigned lead to dealer!`);
      setAssignmentError(null);
      // Refresh data
      fetchUnassignedHqLeads();
      fetchDealerHqStatuses();
      // Close dialog after short delay
      setTimeout(() => {
        setAssignDialogOpen(false);
        setSelectedLead(null);
        setSelectedDealerId(null);
      }, 1500);
    } catch (error: any) {
      setAssignmentError(error.message || 'Failed to assign lead. Dealer may have reached their daily limit.');
      setAssignmentSuccess(null);
    }
  };

  // Update dealer's daily HQ lead limit
  const handleUpdateDealerLimit = async (dealerId: number, newLimit: number) => {
    try {
      await put(`/admin/hq-leads/dealers/${dealerId}/limit`, { dailyLimit: newLimit });
      setEditingDealerLimit(null);
      fetchDealerHqStatuses();
    } catch (error) {
      console.error('Error updating dealer limit:', error);
      alert('Failed to update dealer limit');
    }
  };

  const handleAddNewClick = () => {
    const newEmptySetting: HqLeadSetting = {
      id: -1, // Temporary ID
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

  const renderSettingsContent = () => (
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
          <Typography variant="h6">Package Settings</Typography>
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

  const renderDealerManagementContent = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dealer HQ Lead Status
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dealer Name</TableCell>
                <TableCell>Package Tier</TableCell>
                <TableCell>Today's Quota</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dealerStatuses.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell>
                    {dealer.name} ({dealer.email})
                  </TableCell>
                  <TableCell>{dealer.packageTier}</TableCell>
                  <TableCell>
                    {`${dealer.assignedCount} / ${
                      dealer.dailyLimit === -1 ? '∞' : dealer.dailyLimit
                    }`}
                  </TableCell>
                  <TableCell>{dealer.status}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => handleResetQuota(dealer.id)}
                    >
                      Reset Quota
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderManualManagementContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Unassigned HQ Leads Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Unassigned HQ Leads ({unassignedHqLeads.length})
            </Typography>
            <IconButton onClick={() => { fetchUnassignedHqLeads(); fetchDealerHqStatuses(); }} title="Refresh">
              <RefreshIcon />
            </IconButton>
          </Box>
          
          {unassignedHqLeads.length === 0 ? (
            <Alert severity="info">No unassigned HQ leads at the moment.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
                    <TableCell sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>ID</strong></TableCell>
                    <TableCell sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Customer</strong></TableCell>
                    <TableCell sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Contact</strong></TableCell>
                    <TableCell sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Vehicle</strong></TableCell>
                    <TableCell sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Description</strong></TableCell>
                    <TableCell sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Received</strong></TableCell>
                    <TableCell align="center" sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unassignedHqLeads.map((lead) => (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Chip label={`#${lead.id}`} size="small" color="warning" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">{lead.name || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {lead.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography variant="caption">{lead.email}</Typography>
                            </Box>
                          )}
                          {lead.number && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="caption">{lead.number}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CarIcon fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {lead.vehicle_brand || ''} {lead.vehicle_model || lead.vehicle_series || ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {lead.vehicle_vrm || lead.vehicle_reg || 'No VRM'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={lead.description || 'No description'}>
                          <Typography variant="caption" sx={{ 
                            maxWidth: 200, 
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lead.description || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {lead.createdAt ? new Date(lead.createdAt as unknown as string).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
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

      {/* Dealer Limits Management Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dealer Daily HQ Lead Limits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set individual daily limits for each dealer. Use -1 for unlimited, 0 for no HQ leads.
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
                  <TableCell sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Dealer</strong></TableCell>
                  <TableCell align="center" sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Daily Limit</strong></TableCell>
                  <TableCell align="center" sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Assigned Today</strong></TableCell>
                  <TableCell align="center" sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Status</strong></TableCell>
                  <TableCell align="center" sx={{ color: (theme) => theme.palette.primary.contrastText }}><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dealerHqStatuses.map((dealer) => (
                  <TableRow key={dealer.dealerId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">{dealer.dealerName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {editingDealerLimit?.dealerId === dealer.dealerId ? (
                        <TextField
                          type="number"
                          size="small"
                          value={editingDealerLimit.limit}
                          onChange={(e) => setEditingDealerLimit({ 
                            ...editingDealerLimit, 
                            limit: parseInt(e.target.value, 10) 
                          })}
                          sx={{ width: 80 }}
                          inputProps={{ min: -1 }}
                        />
                      ) : (
                        <Chip
                          label={dealer.dailyHqLeadLimit === -1 ? '∞ Unlimited' : dealer.dailyHqLeadLimit}
                          size="small"
                          color={dealer.dailyHqLeadLimit === -1 ? 'success' : dealer.dailyHqLeadLimit === 0 ? 'default' : 'primary'}
                          variant={dealer.dailyHqLeadLimit === 0 ? 'outlined' : 'filled'}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {dealer.assignedToday}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {dealer.canReceiveMore ? (
                        <Chip icon={<CheckCircleIcon />} label="Available" size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip icon={<WarningIcon />} label="At Limit" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingDealerLimit?.dealerId === dealer.dealerId ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleUpdateDealerLimit(dealer.dealerId, editingDealerLimit.limit)}
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
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingDealerLimit({ dealerId: dealer.dealerId, limit: dealer.dailyHqLeadLimit })}
                          >
                            Edit Limit
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

      {/* Legacy Manual Input (hidden but available) */}
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
            <Button type="submit" variant="outlined" color="primary" size="small">
              Assign
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Assignment Dialog
  const renderAssignmentDialog = () => (
    <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          Assign HQ Lead to Dealer
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedLead && (
          <Box sx={{ mt: 2 }}>
            {/* Lead Preview */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.warning.light }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lead Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Customer</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedLead.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Contact</Typography>
                  <Typography variant="body2">{selectedLead.email || selectedLead.number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Vehicle</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedLead.vehicle_brand} {selectedLead.vehicle_model || selectedLead.vehicle_series}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">VRM</Typography>
                  <Typography variant="body2">{selectedLead.vehicle_vrm || selectedLead.vehicle_reg || 'N/A'}</Typography>
                </Grid>
                {selectedLead.description && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Description</Typography>
                    <Typography variant="body2">{selectedLead.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Dealer Selection */}
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
                  .filter(d => d.canReceiveMore)
                  .map((dealer) => (
                    <MenuItem key={dealer.dealerId} value={dealer.dealerId}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography>{dealer.dealerName}</Typography>
                        <Chip 
                          label={`${dealer.assignedToday}/${dealer.dailyHqLeadLimit === -1 ? '∞' : dealer.dailyHqLeadLimit}`}
                          size="small"
                          color="success"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                <Divider />
                {dealerHqStatuses
                  .filter(d => !d.canReceiveMore)
                  .map((dealer) => (
                    <MenuItem key={dealer.dealerId} value={dealer.dealerId} disabled>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography color="text.secondary">{dealer.dealerName}</Typography>
                        <Chip 
                          label={`At Limit (${dealer.assignedToday}/${dealer.dailyHqLeadLimit})`}
                          size="small"
                          color="warning"
                        />
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Selected Dealer Preview */}
            {selectedDealerId && (
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.success.light }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Selected Dealer
                </Typography>
                {(() => {
                  const dealer = dealerHqStatuses.find(d => d.dealerId === selectedDealerId);
                  if (!dealer) return null;
                  return (
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{dealer.dealerName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Quota: {dealer.assignedToday} / {dealer.dailyHqLeadLimit === -1 ? 'Unlimited' : dealer.dailyHqLeadLimit} today
                      </Typography>
                    </Box>
                  );
                })()}
              </Paper>
            )}

            {/* Success/Error Messages */}
            {assignmentSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>{assignmentSuccess}</Alert>
            )}
            {assignmentError && (
              <Alert severity="error" sx={{ mt: 2 }}>{assignmentError}</Alert>
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
        HQ Leads Management
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Package Settings (Legacy)" />
        <Tab label="Dealer Overview" />
        <Tab label="HQ Lead Assignment" />
      </Tabs>

      {activeTab === 0 && renderContent(renderSettingsContent())}
      {activeTab === 1 && renderContent(renderDealerManagementContent())}
      {activeTab === 2 && renderContent(renderManualManagementContent())}
      
      {renderAssignmentDialog()}
    </Box>
  );
};

export default HqLeadsAdminPage;
