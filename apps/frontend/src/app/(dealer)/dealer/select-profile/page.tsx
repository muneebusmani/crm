'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Business, PersonOutline } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { CompanyUser } from '@crm/types';
import { selectProfileAction } from '@/actions/selectProfileAction';

export default function SelectProfilePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<number | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/company-users', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data);
      
      // Auto-select if only one profile (default)
      if (data.length === 1) {
        handleSelectProfile(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profileId: number) => {
    setSelecting(profileId);
    try {
      const result = await selectProfileAction(profileId);
      
      if (result.success) {
        router.push('/dealer');
      } else {
        setError(result.message || 'Failed to select profile');
        setSelecting(null);
      }
    } catch (err) {
      setError('An error occurred while selecting profile');
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Select Your Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose a profile to continue to the dealer portal
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {profiles.map((profile) => (
          <Grid item xs={12} sm={6} key={profile.id}>
            <Card
              elevation={selecting === profile.id ? 8 : 2}
              sx={{
                transition: 'all 0.3s',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-4px)',
                },
                border: profile.is_default ? 2 : 0,
                borderColor: 'primary.main',
                position: 'relative',
              }}
            >
              {profile.is_default && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  DEFAULT
                </Box>
              )}
              
              <CardActionArea
                onClick={() => handleSelectProfile(profile.id)}
                disabled={selecting !== null}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <PersonOutline fontSize="large" />
                    </Avatar>
                    
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {profile.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {profile.email}
                      </Typography>
                      {profile.position && (
                        <Typography variant="caption" color="text.secondary">
                          {profile.position}
                        </Typography>
                      )}
                    </Box>

                    {selecting === profile.id && (
                      <CircularProgress size={24} />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {profiles.length === 0 && !error && (
        <Alert severity="warning" sx={{ mt: 4 }}>
          No profiles found. Please contact support.
        </Alert>
      )}
    </Container>
  );
}
