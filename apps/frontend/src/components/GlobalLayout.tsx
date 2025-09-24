import { UserType } from '@crm/types';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import theme from '@/theme';
import { Layout } from './Sidebar';

export const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});
const GlobalLayout = async ({ children }: { children: ReactNode }) => {
  const LayoutProps = {
    userType: (await cookies()).get('user_type')?.value as UserType,
  };

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Layout {...LayoutProps}>{children}</Layout>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default GlobalLayout;
