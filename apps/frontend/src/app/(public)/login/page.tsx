import { Suspense, JSX } from 'react';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from './login-page';

// Loading component for Suspense fallback
const LoginLoading = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * Login page wrapper with Suspense boundary.
 * Required because LoginPage uses useSearchParams which needs Suspense for SSR.
 */
const Login = (): JSX.Element => {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPage />
    </Suspense>
  );
};

export default Login;
