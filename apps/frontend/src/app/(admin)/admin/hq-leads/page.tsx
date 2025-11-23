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
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';

interface HqLeadSetting {
  id: number;
  packageTier: string;
  dailyLimit: number;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

const HqLeadsAdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState<HqLeadSetting[]>([]);
  const [newSetting, setNewSetting] = useState({
    packageTier: '',
    dailyLimit: 0,
    isActive: true,
  });
  const [editingSetting, setEditingSetting] = useState<HqLeadSetting | null>(null);

  // Load existing settings
  useEffect(() => {
    fetchHqLeadSettings();
  }, []);

  const fetchHqLeadSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/hq-leads/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching HQ lead settings:', error);
    }
  };

  const handleCreateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/admin/hq-leads/settings', newSetting, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setNewSetting({ packageTier: '', dailyLimit: 0, isActive: true });
      fetchHqLeadSettings(); // Refresh the list
    } catch (error) {
      console.error('Error creating HQ lead setting:', error);
    }
  };

  const handleUpdateSetting = async () => {
    if (!editingSetting) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/hq-leads/settings/${editingSetting.packageTier}`, {
        packageTier: editingSetting.packageTier,
        dailyLimit: editingSetting.dailyLimit,
        isActive: editingSetting.isActive,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setEditingSetting(null);
      fetchHqLeadSettings(); // Refresh the list
    } catch (error) {
      console.error('Error updating HQ lead setting:', error);
    }
  };

  const handleResetQuota = async (dealerId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`/api/admin/hq-leads/reset-quota/${dealerId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      alert('Dealer quota reset successfully');
    } catch (error) {
      console.error('Error resetting dealer quota:', error);
    }
  };

  const handleAssignLead = async (leadId: number, dealerId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`/api/admin/hq-leads/assign/${leadId}/to/${dealerId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      alert('HQ Lead assigned successfully');
    } catch (error) {
      console.error('Error assigning HQ lead:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        HQ Leads Management
      </Typography>
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Package Settings" />
        <Tab label="Manual Management" />
      </Tabs>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Create New Setting Form */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add New Package Setting
                </Typography>
                
                <Box component="form" onSubmit={handleCreateSetting} sx={{ mt: 2 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="package-tier-label">Package Tier</InputLabel>
                    <Select
                      labelId="package-tier-label"
                      value={newSetting.packageTier}
                      label="Package Tier"
                      onChange={(e) => setNewSetting({...newSetting, packageTier: e.target.value as string})}
                    >
                      <MenuItem value="Bronze">Bronze</MenuItem>
                      <MenuItem value="Silver">Silver</MenuItem>
                      <MenuItem value="Gold">Gold</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Daily Limit"
                    type="number"
                    value={newSetting.dailyLimit}
                    onChange={(e) => setNewSetting({...newSetting, dailyLimit: parseInt(e.target.value) || 0})}
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSetting.isActive}
                        onChange={(e) => setNewSetting({...newSetting, isActive: e.target.checked})}
                      />
                    }
                    label="Active"
                    sx={{ mb: 2 }}
                  />
                  
                  <Button type="submit" variant="contained" color="primary">
                    Create Setting
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Existing Settings List */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Existing Package Settings
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Package</TableCell>
                        <TableCell>Daily Limit</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {settings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell>{setting.packageTier}</TableCell>
                          <TableCell>
                            {setting.dailyLimit === -1 ? 'Unlimited' : setting.dailyLimit}
                          </TableCell>
                          <TableCell>
                            {editingSetting?.id === setting.id ? (
                              <Switch
                                checked={editingSetting.isActive}
                                onChange={(e) => setEditingSetting({
                                  ...editingSetting,
                                  isActive: e.target.checked
                                })}
                              />
                            ) : (
                              <Switch
                                checked={setting.isActive}
                                onChange={async (e) => {
                                  // Update setting directly when switch is toggled
                                  const updatedSetting = {
                                    ...setting,
                                    isActive: e.target.checked
                                  };
                                  try {
                                    const token = localStorage.getItem('adminToken');
                                    await axios.put(`/api/admin/hq-leads/settings/${setting.packageTier}`, updatedSetting, {
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`,
                                      },
                                    });
                                    setSettings(settings.map(s => 
                                      s.id === setting.id ? updatedSetting : s
                                    ));
                                  } catch (error) {
                                    console.error('Error updating setting:', error);
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
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
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Manual Override Tools
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h7" gutterBottom>
                    Reset Dealer Quota
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <TextField 
                      label="Dealer ID" 
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <Button 
                      variant="outlined" 
                      color="warning"
                      onClick={() => handleResetQuota(1)} // Example dealer ID
                    >
                      Reset Quota
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h7" gutterBottom>
                    Assign HQ Lead to Dealer
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <TextField 
                      label="Lead ID" 
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <TextField 
                      label="Dealer ID" 
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleAssignLead(1, 1)} // Example lead and dealer IDs
                    >
                      Assign Lead
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default HqLeadsAdminPage;