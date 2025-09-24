import type { Metadata } from 'next';
import '@/app/globals.css';
import GlobalLayout, { roboto } from '@/components/GlobalLayout';

export const metadata: Metadata = {
  title: 'CRM | Dealer',
  description: 'Engine Finders CRM Dealer Portal',
};

export default async function DealerLayout({
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
