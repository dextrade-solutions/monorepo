import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { DexUiProvider, useDexUI } from 'dex-ui';
import { useSelector } from 'react-redux';

import DepositWalletComponent from './components/app/modals/deposit-wallet';
import LoginModalComponent from './components/app/modals/login-modal';
import SetWalletComponent from './components/app/modals/set-wallet';
import TradeHistoryRowModalComponent from './components/app/modals/trade-history-row-modal';
import WalletsListComponent from './components/app/modals/wallets-list';
import Web3ModalProvider from './components/app/web3-modal-provider';
import Web3SolanaProvider from './components/app/web3-solana-provider/web3-solana-provider';
import { getCurrentTheme } from './ducks/app/app';
import { getCurrentLocale } from './ducks/locale/locale';
import Pages from './pages';
import { store } from './store/store';

export function App() {
  const theme = useSelector(getCurrentTheme);
  const locale = useSelector(getCurrentLocale);
  const { muiTheme } = useDexUI({ theme });
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
              WALLETS_LIST: WalletsListComponent,
            }}
            theme={muiTheme}
            locale={locale}
          >
            <CssBaseline />
            <Container maxWidth="sm">
              <Box paddingY={3}>
                <Pages />
              </Box>
            </Container>
          </DexUiProvider>
        </Web3SolanaProvider>
      </Web3ModalProvider>
    </ThemeProvider>
  );
}
