import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { JSX, ReactNode } from "react";
import theme from "@/theme";

const GlobalLayout = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default GlobalLayout;
