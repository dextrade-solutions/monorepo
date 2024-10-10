import { AppBar, Box, Button, Container, Toolbar } from '@mui/material';
import { useWalletInfo, useWeb3Modal } from '@web3modal/wagmi/react';
import { shortenAddress } from 'dex-helpers';
import { PulseLoader, UrlIcon } from 'dex-ui';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { useAuthP2P } from '../../hooks/useAuthP2P';

export default function AppHeader() {
  // eslint-disable-next-line no-shadow
  const auth = useAuthP2P();
  const { open } = useWeb3Modal();
  const { walletInfo } = useWalletInfo();
  const { address } = useAccount();
  const isConnected = Boolean(walletInfo?.name);
  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      enableColorOnDark
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box display="flex" alignItems="center" width="100%">
            <Link to="/" className="flex-grow">
              <img src="/images/logo/dextrade-full.svg" />
            </Link>
            <Button
              variant={isConnected ? 'outlined' : 'contained'}
              disableElevation
              onClick={() => (isConnected ? open() : auth())}
            >
              {isConnected ? shortenAddress(address) : 'Connect wallet'}
              {isConnected && (
                <Box marginLeft={2}>
                  {walletInfo?.name ? (
                    <UrlIcon url={walletInfo.icon} />
                  ) : (
                    <PulseLoader />
                  )}
                </Box>
              )}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
