'use client';
import {
  Alert,
  Box,
  Button,
  Container,
  CssBaseline,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useActionState, useState, useEffect, useCallback } from 'react';
import { loginAction } from '@/actions/loginAction';
import { useRouter } from 'next/navigation';

const Logo = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      mb: 4,
    }}
  >
    <Image
      src="/images/enginefinders.jpg"
      alt="Engine Finders Logo"
      width={180}
      height={180}
      style={{ objectFit: 'contain' }}
    />
  </Box>
);

export default function LoginPage() {
  const [message, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const normalizeErrorMessage = useCallback((value: unknown): string => {
    if (!value) return 'Login failed';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const v: any = value;
      if (typeof v.message === 'string') return v.message;
      if (Array.isArray(v.message)) return v.message.join(', ');
      if (typeof v.error === 'string') return v.error;
      try {
        return JSON.stringify(value);
      } catch {
        return 'Login failed';
      }
    }
    return String(value);
  }, []);

  // useEffect(() => {
  //   if (!message) return;
  //   const content = normalizeErrorMessage((message as any)?.message ?? message);
  //   setSnackbar((prev) => ({
  //     ...prev,
  //     open: true,
  //     message: content,
  //     severity: 'error',
  //   }));
  // }, [message, normalizeErrorMessage]);

  useEffect(() => {
    if (!message) return;

    // ✅ Success case
    if ((message as any)?.success) {
      setSnackbar({
        open: true,
        message: (message as any)?.message || 'Login successful',
        severity: 'success',
      });

      // Redirect after short delay
      // setTimeout(() => {
      router.push((message as any).target);
      // }, 1500);
      return;
    }

    // ❌ Error case
    const content = normalizeErrorMessage((message as any)?.message ?? message);
    setSnackbar({
      open: true,
      message: content,
      severity: 'error',
    });
  }, [message, normalizeErrorMessage, router]);
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Background Image */}
        <Image
          src="/images/garage_background_1.jpg" // Placeholder background image
          alt="Garage background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />

        {/* Overlay to darken background slightly */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />

        {/* Login Card */}
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              bgcolor: 'white',
              maxWidth: 400,
            }}
          >
            <Logo />

            <Typography variant="body1" color="textPrimary" mb={3}>
              Welcome to Customer relationship management system
            </Typography>

            <form action={formAction} noValidate>
              <TextField
                label="Email *"
                type="email"
                name="email"
                id="email"
                fullWidth
                margin="normal"
                slotProps={{ inputLabel: { shrink: true } }}
                autoComplete="email"
              />

              <TextField
                label="Password *"
                type="password"
                name="password"
                id="password"
                fullWidth
                margin="normal"
                slotProps={{ inputLabel: { shrink: true } }}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, py: 1.5 }}
                disabled={isPending}
                aria-busy={isPending}
              >
                {isPending ? (
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Box>
        </Container>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
