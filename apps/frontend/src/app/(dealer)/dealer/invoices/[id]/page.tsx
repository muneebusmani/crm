'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';

function InvoiceRedirect() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  useEffect(() => {
    console.log('Redirecting to invoice:', invoiceId);
    // Use replace to avoid adding to history
    router.replace(`/dealer/invoices?id=${invoiceId}`);
  }, [invoiceId, router]);

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

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <InvoiceRedirect />
    </Suspense>
  );
}
