import QuotationsTable from '@/components/quotations/quotations-table';

export default function AdminQuotationsPage() {
  return (
    <QuotationsTable
      apiPath="/admin/quotations"
      previewPathBase="/api/admin/quotations"
      downloadPathBase="/api/admin/quotations"
    />
  );
}
