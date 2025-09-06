"use client"

// app/components/ProfilePage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { LocationOn, Phone, Email, Person, Web, Settings, Close } from '@mui/icons-material';

// Import theme
import { useTheme } from '@mui/material/styles';

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // State for editable fields
  const [profileData, setProfileData] = useState({
    fullName: 'Anna Adame',
    mobile: '+1 987 6543',
    email: 'daveadame@verizon.com',
    location: 'California, United States',
    joiningDate: '24 Nov 2021',
    about: 'Hi I\'m Anna Adame, It will be as simple as Occidental; in fact, it will be Occidental. To an English person, it will seem like simplified English, as a skeptical Cambridge friend of mine told me what Occidental is European languages are members of the same family.',
    designation: 'Lead Designer / Developer',
    website: 'www.verizon.com',
  });

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the updated data to your API
    console.log('Updated profile:', profileData);
    setOpenEditDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          background: 'linear-gradient(135deg, #4a6fa5, #5b87d0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
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
            src="/static/images/avatar/anna.jpg"
            alt="Anna Adame"
            sx={{
              width: 80,
              height: 80,
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Anna Adame
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Owner & Founder
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <LocationOn sx={{ fontSize: 14 }} />
              <Typography variant="body2" color="textSecondary">
                California, United States
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Themesbrand
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box textAlign="center">
            <Typography variant="h6">24.3K</Typography>
            <Typography variant="body2" color="textSecondary">Followers</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6">1.3K</Typography>
            <Typography variant="body2" color="textSecondary">Following</Typography>
          </Box>
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

      {/* Navigation Tabs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="outlined" color="primary" size="small">
          Overview
        </Button>
        <Button variant="outlined" color="secondary" size="small">
          Activities
        </Button>
        <Button variant="outlined" color="secondary" size="small">
          Projects
        </Button>
        <Button variant="outlined" color="secondary" size="small">
          Documents
        </Button>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Complete Your Profile
              </Typography>
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">30%</Typography>
                  <Typography variant="body2">Progress</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 8, bgcolor: '#e0e0e0', borderRadius: 1 }}>
                  <Box
                    sx={{
                      width: '30%',
                      height: '100%',
                      bgcolor: theme.palette.primary.main,
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Info</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">Full Name:</Typography>
                  <Typography variant="body2" color="textSecondary">{profileData.fullName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">Mobile:</Typography>
                  <Typography variant="body2" color="textSecondary">{profileData.mobile}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">E-mail:</Typography>
                  <Typography variant="body2" color="textSecondary">{profileData.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">Location:</Typography>
                  <Typography variant="body2" color="textSecondary">{profileData.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">Joining Date:</Typography>
                  <Typography variant="body2" color="textSecondary">{profileData.joiningDate}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>About</Typography>
              <Typography variant="body1" paragraph>
                {profileData.about}
              </Typography>

              <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Designation:</Typography>
                    <Typography variant="body1">{profileData.designation}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Web sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Website:</Typography>
                    <Typography variant="body1" color="primary.main" component="a" href={`https://${profileData.website}`}>
                      {profileData.website}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Box>
                  <Button size="small">Today</Button>
                  <Button size="small">Weekly</Button>
                  <Button size="small">Monthly</Button>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', mb: 2 }}>
                <Avatar src="/static/images/avatar/jacqueline.jpg" alt="Jacqueline Steve" />
                <Box>
                  <Typography variant="subtitle2">Jacqueline Steve</Typography>
                  <Typography variant="body2" color="textSecondary">
                    We has changed 2 attributes on 05:16PM
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                In an awareness campaign, it is vital for people to begin put 2 and 2 together and begin to recognize your cause. Too much or too little spacing, as in the example below, can make things unpleasant for the reader. The goal is to...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Profile</Typography>
            <IconButton onClick={handleCloseEditDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mobile"
                  name="mobile"
                  value={profileData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Joining Date"
                  name="joiningDate"
                  value={profileData.joiningDate}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="About"
                  name="about"
                  value={profileData.about}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={profileData.designation}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;