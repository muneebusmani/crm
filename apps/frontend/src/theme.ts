'use client';
import { createTheme, type PaletteMode } from '@mui/material/styles';

export const getTheme = (mode: PaletteMode) => createTheme({
  cssVariables: true,
  palette: {
    mode,
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
});

// Default theme (light)
const theme = getTheme('light');

export default theme;
