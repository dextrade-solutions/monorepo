import { useMediaQuery, createTheme } from '@mui/material';
import React from 'react';

import Palette from '../palette';

export function useDexUI({ theme }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const paletteMode =
    (theme !== 'system' && theme) || (prefersDarkMode ? 'dark' : 'light'); // TODO: Fix light mode

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: paletteMode,
          ...Palette[paletteMode],
        },
        typography: {
          fontFamily: ['Rubik', '-apple-system', 'sans-serif'].join(','),
        },
        shape: {
          borderRadius: 17,
        },
      }),
    [paletteMode],
  );
  return { muiTheme };
}
