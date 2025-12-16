'use client';
import { createTheme, type PaletteMode } from '@mui/material/styles';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    cssVariables: true,
    palette: {
      mode,
      primary: {
        main: '#415189',
        ...(mode === 'dark' && {
          main: '#5c6da8', // Slightly lighter/desaturated for dark mode legibility
        }),
      },
      ...(mode === 'light' && {
        background: {
          default: '#fafafa', // Pale white background
          paper: '#ffffff', // Keep paper elements pure white
        },
      }),
    },
    typography: {
      fontFamily: 'var(--font-roboto)',
    },
  });

// Default theme (light)
const theme = getTheme('light');

export default theme;
