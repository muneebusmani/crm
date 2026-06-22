import InvoicesTable from '@/components/invoices/invoices-table';

export default function AdminInvoicesPage() {
  return (
    <InvoicesTable
      apiPath="/admin/invoices"
      previewPathBase="/api/admin/invoices"
      downloadPathBase="/api/admin/invoices"
    />
  );
}
