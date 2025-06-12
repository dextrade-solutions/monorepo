import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import { init, isTMA } from '@telegram-apps/sdk';
import { DexUiProvider, useDexUI } from 'dex-ui';
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import ConnectedWallets from './components/app/modals/connected-wallets';
import DepositWalletComponent from './components/app/modals/deposit-wallet';
import LoginModalComponent from './components/app/modals/login-modal';
import SetWalletComponent from './components/app/modals/set-wallet';
import TradeHistoryRowModalComponent from './components/app/modals/trade-history-row-modal';
import Web3ModalProvider from './components/app/web3-modal-provider';
import Web3SolanaProvider from './components/app/web3-solana-provider/web3-solana-provider';
import { Footer } from './components/app/footer';
import { UserAuthProvider } from './contexts/auth-context';
import { getCurrentTheme, setTheme } from './ducks/app/app';
import { getCurrentLocale } from './ducks/locale/locale';
import { useTelegramViewportHack } from './hooks/useTelegramViewportHack';
import Pages from './pages';
import { store } from './store/store';

if (isTMA()) {
  init();
}

export function App() {
  const theme = useSelector(getCurrentTheme);
  const locale = useSelector(getCurrentLocale);
  const { muiTheme } = useDexUI({ theme });
  const location = useLocation();
  const dispatch = useDispatch();

  const ref = useRef<HTMLDivElement>(null);
  useTelegramViewportHack(ref);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    if (mode) {
      dispatch(setTheme(mode));
    }
  }, [location.search, dispatch]);

  return (
    <ThemeProvider theme={muiTheme}>
      <Web3ModalProvider>
        <Web3SolanaProvider>
          <DexUiProvider
            store={store}
            modals={{
              SET_WALLET: SetWalletComponent,
              LOGIN_MODAL: LoginModalComponent,
              DEPOSIT_WALLET: DepositWalletComponent,
              TRADE_HISTORY_ROW: TradeHistoryRowModalComponent,
              CONNECTED_WALLETS_LIST: ConnectedWallets,
            }}
            theme={muiTheme}
            locale={locale}
          >
            <UserAuthProvider>
              <CssBaseline />
              <Container
                ref={ref}
                className="h-root"
                sx={{ 
                  py: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh'
                }}
                maxWidth="sm"
              >
                <Pages />
                <Footer />
              </Container>
            </UserAuthProvider>
          </DexUiProvider>
        </Web3SolanaProvider>
      </Web3ModalProvider>
    </ThemeProvider>
  );
}
