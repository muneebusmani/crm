'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminQuotationRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;

  useEffect(() => {
    router.replace(`/admin/quotations?id=${quotationId}`);
  }, [quotationId, router]);

  return null;
}
