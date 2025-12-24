import type { Metadata } from 'next';
import '@/app/globals.css';
import { UserType } from '@crm/types';
import { cookies } from 'next/headers';
import GlobalLayout, { roboto } from '@/components/global-layout';
import { Layout } from '@/components/sidebar';
import DealerTopbarWrapper from '@/components/dealer-topbar-wrapper';
import { DeviceSessionWrapper } from '@/components/device-session-wrapper';

export const metadata: Metadata = {
  title: 'CRM | Dealer',
  description: 'Engine Finders CRM Dealer Portal',
};

export default async function DealerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const LayoutProps = {
    userType: cookieStore.get('user_type')?.value as UserType,
    selectedProfileName: cookieStore.get('selected_profile_name')?.value,
    selectedProfileEmail: cookieStore.get('selected_profile_email')?.value,
  };
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <GlobalLayout>
          <DeviceSessionWrapper userId={userId}>
            <Layout {...LayoutProps}>
              <DealerTopbarWrapper />
              {children}
            </Layout>
          </DeviceSessionWrapper>
        </GlobalLayout>
      </body>
    </html>
  );
}
