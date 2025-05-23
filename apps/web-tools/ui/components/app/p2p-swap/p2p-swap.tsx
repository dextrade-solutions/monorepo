import { Box, Button, Typography } from '@mui/material';
import { Icon, useGlobalModalContext } from 'dex-ui';
import React from 'react';

import { useWallets } from '../../../hooks/asset/useWallets';
import ButtonAppConfig from '../button-app-config';
import './index.scss';
import P2P from '../p2p';

export default function P2PSwap() {
  const { showModal } = useGlobalModalContext();
  const wallets = useWallets();
  const connectedWalletsLength = wallets.filter((w) => w.connected).length;

  return (
    <>
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
      <P2P />
    </>
  );
}
