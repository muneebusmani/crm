// @ts-nocheck
'use client';
import type { Dealer, User } from '@crm/types';
import { Close, LocationOn, Person, Settings, Web } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { get, put } from '@/lib/api';
import BankDetailsSection from './bank-details-selection';

interface DealerData extends User {
  dealer: Dealer;
}
interface DealerInfo {
  id: number;
  email: string;
  username: string;
  name: string;
  owner: string;
  location: string;
  logo: string;
  website: string;
  contactEmail: string;
  tierId?: number;
  tierName?: string;
}

const Profile = () => {
  const theme = useTheme();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [profileData, setProfileData] = useState<DealerInfo>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userData = await get<DealerData>('/dealers/profile/me');
        console.log('response: ', userData);

        const {
          id,
          email,
          username,
          dealer: {
            tier: { id: tierId, name: tierName },
            ...dealerRest
          },
        } = userData;

        const profile = {
          id,
          email,
          username,
          ...dealerRest,
          tierId,
          tierName,
        };
        setProfileData(profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    owner: '',
    location: '',
    logo: '',
    website: '',
    contactEmail: '',
    tierId: 1,
  });

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading your profile...</Typography>
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Failed to load profile.</Typography>
      </Box>
    );
  }

  const handleOpenEditDialog = () => {
    if (profileData) {
      setFormData({
        name: profileData.name,
        email: profileData.email,
        username: profileData.username,
        password: '',
        owner: profileData.owner,
        location: profileData.location,
        logo: profileData.logo,
        website: profileData.website,
        contactEmail: profileData.contactEmail,
        tierId: profileData.tierId || 1,
      });
    }
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;

    try {
      const dataToSend = {
        ...formData,
        // Backend expects password field — send empty string if not changing
        password: formData.password || '',
      };

      const updatedData = await put<DealerData>(
        '/dealers/profile/me',
        dataToSend,
      );

      const {
        id,
        email,
        username,
        dealer: {
          tier: { id: tierId, name: tierName },
          ...dealerRest
        },
      } = updatedData;

      const updatedProfile = {
        id,
        email,
        username,
        ...dealerRest,
        tierId,
        tierName,
      };

      setProfileData(updatedProfile);
      setOpenEditDialog(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  // --- RENDER UI ---
  console.log(profileData.logo);
  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          backgroundColor: theme.palette.primary.dark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: theme.palette.primary.contrastText,
          px: 3,
          pb: 3,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          overflow: 'hidden',
          marginBottom: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={profileData.logo}
            alt={profileData.owner}
            sx={{
              width: 80,
              height: 80,
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {profileData.name}
            </Typography>
            <Typography variant="subtitle1">
              Owned by {profileData.owner}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <LocationOn sx={{ fontSize: 14 }} />
              <Typography variant="body2">{profileData.location}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Settings />}
            onClick={handleOpenEditDialog}
            sx={{ ml: 2 }}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      {/* NAVIGATION TABS */}
      {/* <Box sx={{ display: 'flex', gap: 2, mb: 3 }}> */}
      {/*   <Button variant="outlined" color="primary" size="small"> */}
      {/*     Overview */}
      {/*   </Button> */}
      {/*   <Button variant="outlined" color="secondary" size="small"> */}
      {/*     Activities */}
      {/*   </Button> */}
      {/*   <Button variant="outlined" color="secondary" size="small"> */}
      {/*     Projects */}
      {/*   </Button> */}
      {/*   <Button variant="outlined" color="secondary" size="small"> */}
      {/*     Documents */}
      {/*   </Button> */}
      {/* </Box> */}

      {/* MAIN GRID */}
      <Grid spacing={3}>
        {/* LEFT COLUMN */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* <Card sx={{ mb: 2 }}> */}
          {/*   <CardContent> */}
          {/*     <Typography variant="h6" gutterBottom> */}
          {/*       Dealer Tier Status */}
          {/*     </Typography> */}
          {/* Progress bar logic can be dynamic later */}
          {/*     <Box sx={{ width: '100%', mb: 2 }}> */}
          {/*       <Box */}
          {/*         sx={{ */}
          {/*           display: 'flex', */}
          {/*           justifyContent: 'space-between', */}
          {/*           mb: 1, */}
          {/*         }} */}
          {/*       > */}
          {/*         <Typography variant="body2">65%</Typography> */}
          {/*         <Typography variant="body2">Tier Progress</Typography> */}
          {/*       </Box> */}
          {/*       <Box */}
          {/*         sx={{ */}
          {/*           width: '100%', */}
          {/*           height: 8, */}
          {/*           bgcolor: '#e0e0e0', */}
          {/*           borderRadius: 1, */}
          {/*         }} */}
          {/*       > */}
          {/*         <Box */}
          {/*           sx={{ */}
          {/*             width: '65%', */}
          {/*             height: '100%', */}
          {/*             bgcolor: theme.palette.success.main, */}
          {/*             borderRadius: 1, */}
          {/*           }} */}
          {/*         /> */}
          {/*       </Box> */}
          {/*     </Box> */}
          {/*   </CardContent> */}
          {/* </Card> */}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Info
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Dealer Name:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Owner:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.owner}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Contact Email:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.contactEmail}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Location:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Username:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    @{profileData.username}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Login Email:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About Dealer
              </Typography>
              <Typography variant="body1" component="p" gutterBottom>
                Welcome to {profileData.name}, owned by {profileData.owner}. We
                provide top-tier services and products to our customers across{' '}
                {profileData.location}. Visit our website to learn more!
              </Typography>

              <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Owner:
                    </Typography>
                    <Typography variant="body1">{profileData.owner}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Web sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Website:
                    </Typography>
                    <Typography
                      variant="body1"
                      color="primary.main"
                      component="a"
                      href={
                        profileData.website.startsWith('http')
                          ? profileData.website
                          : `https://${profileData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {profileData.website}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Bank Details Section */}
          <Box sx={{ mt: 3 }}>
            <BankDetailsSection />
          </Box>
        </Grid>
      </Grid>

      {/* EDIT DIALOG */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Edit Dealer Profile</Typography>
            <IconButton onClick={handleCloseEditDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Dealer Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  type="email"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Username (Login)"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Login Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  type="email"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="/static/images/avatar/default.jpg"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Password (Leave blank to keep current)"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  type="password"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tier ID (Advanced)"
                  name="tierId"
                  value={formData.tierId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tierId: Number(e.target.value),
                    }))
                  }
                  type="number"
                />
              </Grid>
            </Grid>
            <DialogActions>
              <Button onClick={handleCloseEditDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Profile;
