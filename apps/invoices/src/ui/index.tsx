import { Box, Container, ThemeProvider, CssBaseline } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import React from 'react';

import './css/index.scss';
import './i18n';
import Invoice from './components/invoices';
import { AuthData } from '../app/types/auth';

log.setLevel(log.levels.DEBUG);

export function UI() {
  const [auth] = useLocalStorage<AuthData | null>('auth');
  const { muiTheme } = useDexUI();

  const renderBody = () => (
    <>
      <Container maxWidth="sm">
        <Box paddingY={3}>
          <Invoice />
        </Box>
      </Container>
    </>
  );
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <DexUiProvider theme={muiTheme} locale={auth?.lang}>
        {renderBody()}
      </DexUiProvider>
    </ThemeProvider>
  );
}
