import { useMediaQuery, createTheme } from '@mui/material';
import React from 'react';

import Palette from '../palette';

export function useDexUI({
  theme,
}: {
  theme?: 'dark' | 'light' | 'system';
} = {}) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const paletteMode =
    (theme !== 'system' && theme) || (prefersDarkMode ? 'dark' : 'light');

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: paletteMode,
          ...Palette[paletteMode],
        },
        typography: {
          fontFamily: ['OpenSans', '-apple-system', 'sans-serif'].join(','),
        },
        shape: {
          borderRadius: 17,
        },
        zIndex: {
          modal: 999,
          drawer: 999,
        },
        components: {
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  // Target OutlinedInput specifically
                  borderRadius: 8,
                  backgroundColor:
                    paletteMode === 'dark' ? '#2D2338' : '#F5F5FB', // Lighter background based on paletteMode
                  '&.Mui-focused fieldset': {
                    // Focused state
                    //  Adjust border color as needed for focused state
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                border: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none', // Add textTransform: none
                fontWeight: 600,
              },
            },
            defaultProps: {
              disableElevation: true,
              disableRipple: true,
            },
          },
          MuiButtonBase: {
            defaultProps: {
              disableRipple: true,
            },
          },
          MuiIconButton: {
            defaultProps: {
              disableRipple: true,
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body:
                paletteMode === 'dark'
                  ? {
                      background: '#1D1D1D',
                      'background-repeat': 'no-repeat',
                      backgroundAttachment: 'fixed !important',
                      backgroundImage:
                        'linear-gradient(0deg, #1D1D1D 0%, #1D1D1D 90%, #3F265F 130%)',
                    }
                  : {},
            },
          },
        },
      }),
    [paletteMode],
  );
  return { muiTheme };
}
