import { ThemeProvider, useMediaQuery, createTheme } from '@mui/material';
import React, { createContext } from 'react';

import Palette from '../palette';

export const DexUiContext = createContext({
  theme: null,
  t: (key: string) => key,
});

export const DexUiProvider = ({
  children,
  t,
  theme,
}: {
  children: React.ReactNode;
  theme: string;
  t: () => void;
}) => {
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
  debugger;

  return (
    <ThemeProvider theme={muiTheme}>
      <DexUiContext.Provider value={{ paletteMode, t }}>
        {children}
      </DexUiContext.Provider>
    </ThemeProvider>
  );
};
