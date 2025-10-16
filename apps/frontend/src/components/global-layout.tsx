import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';
import type { ReactNode } from 'react';
import theme from '@/theme';
import StoreProvider from '@/app/store-provider';

export const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});
const GlobalLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <StoreProvider>
          {children}
        </StoreProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default GlobalLayout;
