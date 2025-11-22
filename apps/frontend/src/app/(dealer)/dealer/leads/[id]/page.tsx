'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';

function LeadRedirect() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  useEffect(() => {
    console.log('Redirecting to lead:', leadId);
    // Use replace to avoid adding to history
    router.replace(`/dealer/leads?id=${leadId}`);
  }, [leadId, router]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    </Container>
  );
}

export default function LeadDetailPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <LeadRedirect />
    </Suspense>
  );
}
