import { Box, Button } from '@mui/material';
// import { useWalletInfo, useWeb3Modal } from '@web3modal/wagmi/react';
import { shortenAddress } from 'dex-helpers';
import { PulseLoader, UrlIcon } from 'dex-ui';
import { useAccount } from 'wagmi';

import { useAuthP2P } from '../../hooks/useAuthP2P';

export default function WalletConnectButton() {
  // eslint-disable-next-line no-shadow
  const auth = useAuthP2P();
  const { open } = useWeb3Modal();
  const { walletInfo } = useWalletInfo();
  const { address } = useAccount();
  const isConnected = Boolean(walletInfo?.name);

  return (
    <Button
      variant={isConnected ? 'outlined' : 'contained'}
      disableElevation
      sx={{
        backgroundImage: isConnected
          ? undefined
          : 'linear-gradient(-68deg, #00C283 12%, #3C76FF 87%)',
      }}
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
  );
}
