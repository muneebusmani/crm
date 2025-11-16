'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';

function QuotationRedirect() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;

  useEffect(() => {
    console.log('Redirecting to quotation:', quotationId);
    // Use replace to avoid adding to history
    router.replace(`/dealer/quotations?id=${quotationId}`);
  }, [quotationId, router]);

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

export default function QuotationDetailPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <QuotationRedirect />
    </Suspense>
  );
}
