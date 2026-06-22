'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminInvoiceRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  useEffect(() => {
    router.replace(`/admin/invoices?id=${invoiceId}`);
  }, [invoiceId, router]);

  return null;
}
