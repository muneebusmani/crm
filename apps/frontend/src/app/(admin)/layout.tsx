import type { Metadata } from 'next';
import '@/app/globals.css';
import GlobalLayout, { roboto } from '@/components/GlobalLayout';

export const metadata: Metadata = {
  title: 'CRM | Admin',
  description: 'Engine Finders CRM Admin Portal',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  );
}
