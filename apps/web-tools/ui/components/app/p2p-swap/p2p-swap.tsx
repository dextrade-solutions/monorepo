import { Box, Button, Card, Typography } from '@mui/material';
import classNames from 'classnames';
import { Icon, useGlobalModalContext } from 'dex-ui';
import React from 'react';

import InputAmount from './input-amount';
import { useWallets } from '../../../hooks/asset/useWallets';
import { useDetectSticky } from '../../../hooks/useDetectStycky';
import SelectCoins from '../../ui/select-coins';
import ButtonAppConfig from '../button-app-config';
import P2PExchangers from '../p2p-ads';
import './index.scss';

export default function P2PSwap() {
  const { showModal } = useGlobalModalContext();
  const [isSticky, ref] = useDetectSticky();
  const wallets = useWallets();
  const connectedWalletsLength = wallets.filter((w) => w.connected).length;

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
        {/* <WalletConnectButton /> */}
        <Box marginLeft={2}>
          {Boolean(connectedWalletsLength) && (
            <Button
              color="inherit"
              onClick={() => showModal({ name: 'CONNECTED_WALLETS_LIST' })}
            >
              <Typography fontWeight="bold" marginRight={1} variant="h6">
                {connectedWalletsLength}
              </Typography>
              <Icon name="wallet" size="xl" />
            </Button>
          )}
        </Box>
        <Box ml={2}>
          <ButtonAppConfig />
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
