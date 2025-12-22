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
import {
  useActionState,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
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

/**
 * Generate a simple browser fingerprint for device identification.
 * Uses a combination of browser properties to create a semi-unique identifier.
 */
async function generateFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    // @ts-expect-error - deviceMemory may not exist in all browsers
    navigator.deviceMemory || 'unknown',
  ];

  const fingerprint = components.join('|');

  // Create a hash of the fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

export default function LoginPage() {
  const [message, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();
  const [fingerprint, setFingerprint] = useState<string>('');
  const fingerprintRef = useRef<HTMLInputElement>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Generate fingerprint on mount
  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const fp = await generateFingerprint();
        setFingerprint(fp);
      } catch (err) {
        console.warn('Failed to generate fingerprint:', err);
        // Fallback to a random ID if fingerprint generation fails
        setFingerprint(
          `fallback-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        );
      }
    };
    loadFingerprint();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const normalizeErrorMessage = useCallback((value: unknown): string => {
    if (!value) return 'Login failed';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const v = value as Record<string, unknown>;
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

  useEffect(() => {
    if (!message) return;

    // Success case
    if ((message as { success?: boolean })?.success) {
      setSnackbar({
        open: true,
        message:
          (message as { message?: string })?.message || 'Login successful',
        severity: 'success',
      });

      router.push((message as { target: string }).target);
      return;
    }

    // Error case - determine severity based on error code
    const errorCode = (message as { errorCode?: string })?.errorCode;
    let severity: 'error' | 'warning' = 'error';

    // Use warning for account-related issues (not invalid credentials)
    if (
      errorCode === 'ACCOUNT_SUSPENDED' ||
      errorCode === 'ACCOUNT_INACTIVE' ||
      errorCode === 'DEVICE_LIMIT_REACHED'
    ) {
      severity = 'warning';
    }

    const content = normalizeErrorMessage(
      (message as { message?: unknown })?.message ?? message,
    );
    setSnackbar({
      open: true,
      message: content,
      severity,
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
              bgcolor: 'background.paper',
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

              {/* Hidden field for device fingerprint */}
              <input
                type="hidden"
                name="deviceFingerprint"
                value={fingerprint}
                ref={fingerprintRef}
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
