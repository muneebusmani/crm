'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import { Add as AddIcon, CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { CompanyUser } from '@crm/types';
import { selectProfileAction } from '@/actions/selectProfileAction';

export default function SelectProfilePage() {
  const router = useRouter();
  const theme = useTheme();
  const [profiles, setProfiles] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null,
  );

  const handleSelectProfile = async (profileId: number) => {
    setSelecting(profileId);
    try {
      const result = await selectProfileAction(profileId);

      if (result.success) {
        // Update local state to show selection immediately
        setSelectedProfileId(profileId);

        // Small delay to ensure cookies are fully set before navigation
        // This prevents the infinite loading issue while preserving WebSocket connections
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Navigate to dealer dashboard - the middleware will pick up the new cookies
        router.push('/dealer');
      } else {
        setError(result.message || 'Failed to select profile');
        setSelecting(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select profile');
      setSelecting(null);
    }
  };

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/company-users', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data);

      const selectedResponse = await fetch('/api/selected-profile', {
        credentials: 'include',
      });

      if (selectedResponse.ok) {
        const selectedData = await selectedResponse.json();
        if (selectedData.selected && selectedData.id) {
          setSelectedProfileId(selectedData.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default', // Or specific grey like Chrome's #f1f3f4 if desired, but default is safer
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h4"
            fontWeight="500"
            gutterBottom
            sx={{ color: 'text.primary' }}
          >
            Who is using this device?
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
            mb: 6,
          }}
        >
          {profiles.map((profile) => (
            <Box
              key={profile.id}
              onClick={() => handleSelectProfile(profile.id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  '& .profile-avatar': {
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '& .profile-name': {
                    color: 'primary.main',
                  },
                },
                opacity:
                  selecting !== null && selecting !== profile.id ? 0.5 : 1,
                pointerEvents: selecting !== null ? 'none' : 'auto',
              }}
            >
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  className="profile-avatar"
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'grey.200',
                    color: 'grey.700',
                    fontSize: '2.5rem',
                    transition: 'box-shadow 0.2s',
                    border:
                      selectedProfileId === profile.id
                        ? `4px solid ${theme.palette.primary.main}`
                        : 'none',
                  }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </Avatar>
                {selecting === profile.id && (
                  <CircularProgress
                    size={100}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      color: 'primary.main',
                    }}
                  />
                )}
                {selectedProfileId === profile.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'success.main',
                      color: 'white',
                      borderRadius: '50%',
                      p: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                    }}
                  >
                    <CheckCircle fontSize="small" />
                  </Box>
                )}
              </Box>
              <Typography
                className="profile-name"
                variant="h6"
                fontWeight="400"
                sx={{
                  color: 'text.primary',
                  transition: 'color 0.2s',
                  maxWidth: 200,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: 200,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.email}
              </Typography>
              {profile.position && (
                <Typography variant="caption" color="text.secondary">
                  {profile.position}
                </Typography>
              )}
              {profile.is_default && selectedProfileId !== profile.id && (
                <Typography
                  variant="caption"
                  sx={{ color: 'primary.main', fontWeight: 'bold', mt: 0.5 }}
                >
                  DEFAULT
                </Typography>
              )}
            </Box>
          ))}

          {/* Add Profile / Manage Option styled similarly */}
          <Box
            onClick={() => router.push('/dealer/profiles')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                '& .add-avatar': {
                  bgcolor: 'grey.300',
                },
                '& .add-text': {
                  color: 'text.primary',
                },
              },
            }}
          >
            <Avatar
              className="add-avatar"
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'grey.100',
                color: 'text.secondary',
                mb: 2,
                transition: 'background-color 0.2s',
              }}
            >
              <AddIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              className="add-text"
              variant="h6"
              fontWeight="400"
              color="text.secondary"
              sx={{ transition: 'color 0.2s' }}
            >
              Add / Manage
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
