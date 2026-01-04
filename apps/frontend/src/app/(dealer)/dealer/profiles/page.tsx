'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Avatar,
  Divider,
  Stack,
  Paper,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PersonOutline,
  Email,
  Phone,
  Work,
  StarBorder,
  Star,
  ArrowBack,
} from '@mui/icons-material';
import type { CompanyUser, CreateCompanyUserDto } from '@crm/types';
export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyUser | null>(
    null,
  );
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
      setError('Cannot delete default profile');
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <IconButton
            onClick={() => router.back()}
            sx={{ mt: 0.5 }}
            aria-label="Go back"
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom>
              Company Profiles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage team members who can access the dealer portal
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Add Profile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {profiles.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <PersonOutline
            sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No Profiles Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first company profile to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add First Profile
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {profiles.map((profile) => (
            <Grid item xs={12} md={6} key={profile.id}>
              <Card
                elevation={profile.is_default ? 4 : 1}
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  border: profile.is_default ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': {
                    elevation: 6,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: profile.is_default
                          ? 'primary.main'
                          : 'secondary.main',
                        mr: 2,
                      }}
                    >
                      {profile.is_default ? (
                        <Star fontSize="large" />
                      ) : (
                        <PersonOutline fontSize="large" />
                      )}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="h6">{profile.name}</Typography>
                        {profile.is_default && (
                          <Chip
                            label="Default"
                            size="small"
                            color="primary"
                            icon={<Star />}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(profile)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDelete(profile.id, profile.is_default)
                        }
                        disabled={profile.is_default}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {profile.email}
                      </Typography>
                    </Box>

                    {profile.phone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {profile.phone}
                        </Typography>
                      </Box>
                    )}

                    {profile.position && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Work fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {profile.position}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {editingProfile ? <Edit /> : <Add />}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {editingProfile ? 'Edit Profile' : 'Add New Profile'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingProfile
                  ? 'Update profile information'
                  : 'Create a new team member profile'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g., John Doe"
              helperText="Required"
            />
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="e.g., john@example.com"
              helperText="Required - This will be used for login"
            />
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="e.g., +1 234 567 8900"
              helperText="Optional"
            />
            <TextField
              label="Position / Role"
              fullWidth
              margin="normal"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="e.g., Sales Manager"
              helperText="Optional"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.email}
          >
            {editingProfile ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
