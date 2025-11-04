'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import type { CompanyUser, CreateCompanyUserDto } from '@crm/types';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyUser | null>(null);
  const [formData, setFormData] = useState<CreateCompanyUserDto>({
    name: '',
    email: '',
    phone: '',
    position: '',
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/company-users', {
        credentials: 'include',
      });
      const data = await response.json();
      setProfiles(data);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (profile?: CompanyUser) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        position: profile.position || '',
      });
    } else {
      setEditingProfile(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProfile(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
    });
  };

  const handleSave = async () => {
    try {
      const url = editingProfile
        ? `/api/company-users/${editingProfile.id}`
        : '/api/company-users';
      
      const method = editingProfile ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      await fetchProfiles();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save profile');
    }
  };

  const handleDelete = async (id: number, isDefault: boolean) => {
    if (isDefault) {
      alert('Cannot delete default profile');
      return;
    }

    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const response = await fetch(`/api/company-users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete profile');

      await fetchProfiles();
    } catch (err) {
      setError('Failed to delete profile');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Company Profiles</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Profile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <List>
            {profiles.map((profile) => (
              <ListItem
                key={profile.id}
                divider
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {profile.name}
                      {profile.is_default && (
                        <Chip label="Default" size="small" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {profile.email}
                      </Typography>
                      {profile.position && (
                        <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                          • {profile.position}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(profile)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(profile.id, profile.is_default)}
                    disabled={profile.is_default}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProfile ? 'Edit Profile' : 'Add New Profile'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            label="Position"
            fullWidth
            margin="normal"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProfile ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
