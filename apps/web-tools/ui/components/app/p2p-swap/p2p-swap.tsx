import {
  Box,
  Button,
  Card,
  Switch,
  Typography,
  useMediaQuery,
} from '@mui/material';
import classNames from 'classnames';
import { Icon, useGlobalModalContext } from 'dex-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

import InputAmount from './input-amount';
import { getCurrentTheme, setTheme } from '../../../ducks/app/app';
import { useWallets } from '../../../hooks/asset/useWallets';
import { useDetectSticky } from '../../../hooks/useDetectStycky';
import SelectCoins from '../../ui/select-coins';
import P2PExchangers from '../p2p-ads';
import WalletConnectButton from '../wallet-connect-button';
import './index.scss';

export default function P2PSwap() {
  const { showModal } = useGlobalModalContext();
  const dispatch = useDispatch();
  const [isSticky, ref] = useDetectSticky();
  const wallets = useWallets();
  const connectedWalletsLength = wallets.filter((w) => w.connected).length;

  const currentTheme = useSelector(getCurrentTheme);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isDarkMode =
    currentTheme === 'system' ? prefersDarkMode : currentTheme === 'dark';
  const toggleDarkMode = () => {
    const toggleValue = isDarkMode ? 'light' : 'dark';
    dispatch(setTheme(toggleValue));
  };
  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        paddingX={1}
        marginBottom={2}
      >
        <Typography fontWeight="bold" variant="h4">
          P2P
        </Typography>
        <div className="flex-grow" />
        <WalletConnectButton />
        <Box marginLeft={2}>
          {Boolean(connectedWalletsLength) && (
            <Button
              color="inherit"
              onClick={() => showModal({ name: 'WALLETS_LIST' })}
            >
              <Typography fontWeight="bold" marginRight={1} variant="h6">
                {connectedWalletsLength}
              </Typography>
              <Icon name="wallet" size="xl" />
            </Button>
          )}
        </Box>
        <Box marginLeft={2} paddingTop={1}>
          <DarkModeSwitch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            moonColor="white"
            sunColor="dark"
          />
        </Box>
      </Box>
      <Card
        ref={ref}
        className={classNames('select-coins-wrap', {
          'select-coins-wrap--is-sticky': Boolean(isSticky),
        })}
        variant="outlined"
        sx={{ bgcolor: 'primary.light' }}
      >
        <Box padding={2}>
          <SelectCoins includeFiats />
          <InputAmount />
        </Box>
      </Card>
      <P2PExchangers />
    </Box>
  );
}
