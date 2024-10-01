import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React, { createContext } from 'react';

export const DexUiContext = createContext({
  t: (key: string) => key,
});

export const DexUiProvider = ({
  children,
  theme,
  t,
}: {
  children: React.ReactNode;
  theme: string;
  t: () => void;
}) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DexUiContext.Provider value={{ t }}>{children}</DexUiContext.Provider>
    </ThemeProvider>
  );
};
