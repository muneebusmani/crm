"use client"

// app/components/ProfilePage.tsx
import React from 'react';
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
} from '@mui/material';
import { LocationOn, Phone, Email, Person, Web, Settings } from '@mui/icons-material';

// Import theme
import { useTheme } from '@mui/material/styles';

const ProfilePage: React.FC = () => {
  const theme = useTheme();

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
                  <Typography variant="body2" color="textSecondary">Anna Adame</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">Mobile:</Typography>
                  <Typography variant="body2" color="textSecondary">+(1) 987 6543</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">E-mail:</Typography>
                  <Typography variant="body2" color="textSecondary">daveadame@verizon.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">Location:</Typography>
                  <Typography variant="body2" color="textSecondary">California, United States</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">Joining Date:</Typography>
                  <Typography variant="body2" color="textSecondary">24 Nov 2021</Typography>
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
                Hi I'm Anna Adame, It will be as simple as Occidental; in fact, it will be Occidental. To an English person, it will seem like simplified English, as a skeptical Cambridge friend of mine told me what Occidental is European languages are members of the same family.
              </Typography>
              <Typography variant="body1" paragraph>
                You always want to make sure that your fonts work well together and try to limit the number of fonts you use to three or less. Experiment and play around with the fonts that you already have in the software you're working with reputable font websites. This may be the most commonly encountered tip I received from the designers I spoke with. They highly encourage that you use different fonts in one design, but do not over-exaggerate and go overboard.
              </Typography>

              <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Designation:</Typography>
                    <Typography variant="body1">Lead Designer / Developer</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Web sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Website:</Typography>
                    <Typography variant="body1" color="primary.main" component="a" href="https://www.verizon.com">
                      www.verizon.com
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
    </Box>
  );
};

export default ProfilePage;