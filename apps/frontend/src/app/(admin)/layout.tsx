import type { Metadata } from 'next';
import '@/app/globals.css';
import { cookies } from 'next/headers';
import GlobalLayout, { roboto } from '@/components/GlobalLayout';
import { Layout } from '@/components/Sidebar';
import { UserType } from '@crm/types';

export const metadata: Metadata = {
  title: 'CRM | Admin',
  description: 'Engine Finders CRM Admin Portal',
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const LayoutProps = {
    userType: (await cookies()).get('user_type')?.value as UserType,
  };
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <GlobalLayout>
          <Layout {...LayoutProps}>{children}</Layout>
        </GlobalLayout>
      </body>
    </html>
  );
}
