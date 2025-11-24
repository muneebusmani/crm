'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { get, post, put } from '@/lib/api';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

interface HqLeadSetting {
  id: number;
  packageTier: string;
  dailyLimit: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
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

  const [dealerStatuses, setDealerStatuses] = useState<DealerStatus[]>([]);

  const [dealerIdToReset, setDealerIdToReset] = useState('');
  const [leadIdToAssign, setLeadIdToAssign] = useState('');
  const [dealerIdToAssign, setDealerIdToAssign] = useState('');

  const fetchHqLeadSettings = async () => {
    try {
      const response = await get('/admin/hq-leads/settings');
      setSettings(response);
    } catch (error) {
      console.error('Error fetching HQ lead settings:', error);
    }
  };

  const fetchDealerStatuses = async () => {
    try {
      const response = await get('/admins/dealers-status');
      setDealerStatuses(response.data);
    } catch (error) {
      console.error('Error fetching dealer statuses:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchHqLeadSettings();
    } else if (activeTab === 1) {
      fetchDealerStatuses();
    }
  }, [activeTab]);

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
    } catch (error) {
      console.error('Error resetting dealer quota:', error);
    }
  };

  const handleAssignLead = async () => {
    const leadId = parseInt(leadIdToAssign, 10);
    const dealerId = parseInt(dealerIdToAssign, 10);

    if (isNaN(leadId) || isNaN(dealerId)) {
      alert('Please enter a valid Lead ID and Dealer ID.');
      return;
    }
    try {
      await post(`/admin/hq-leads/assign/${leadId}/to/${dealerId}`);
      alert('HQ Lead assigned successfully');
      setLeadIdToAssign('');
      setDealerIdToAssign('');
    } catch (error) {
      console.error('Error assigning HQ lead:', error);
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
                    {`${dealer.assignedCount} / ${dealer.dailyLimit === -1 ? '∞' : dealer.dailyLimit}`}
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Manual Override Tools
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem' }} gutterBottom>
                Assign HQ Lead to Dealer
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
                  sx={{ flex: 1 }}
                  required
                />
                <TextField
                  label="Dealer ID"
                  type="number"
                  value={dealerIdToAssign}
                  onChange={(e) => setDealerIdToAssign(e.target.value)}
                  sx={{ flex: 1 }}
                  required
                />
                <Button type="submit" variant="outlined" color="primary">
                  Assign Lead
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
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
        <Tab label="Package Settings" />
        <Tab label="Dealer Management" />
        <Tab label="Manual Assignments" />
      </Tabs>

      {activeTab === 0 && renderSettingsContent()}
      {activeTab === 1 && renderDealerManagementContent()}
      {activeTab === 2 && renderManualManagementContent()}
    </Box>
  );
};

export default HqLeadsAdminPage;
