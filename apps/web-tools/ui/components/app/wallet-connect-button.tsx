import { Box, Button } from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import { PulseLoader, UrlIcon } from 'dex-ui';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { showModal } from '../../ducks/app/app';
import { SETTINGS_ROUTE } from '../../helpers/constants/routes';
import { useAuthWallet } from '../../hooks/useAuthWallet';

export default function WalletConnectButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wallet, isConnected } = useAuthWallet();

  const onClick = () => {
    if (isConnected) {
      navigate(SETTINGS_ROUTE);
    } else {
      dispatch(showModal({ name: 'LOGIN_MODAL' }));
    }
  };

  return (
    <Button
      variant={isConnected ? '' : 'contained'}
      disableElevation
      sx={{
        backgroundImage: isConnected
          ? undefined
          : 'linear-gradient(-68deg, #00C283 12%, #3C76FF 87%)',
      }}
      onClick={onClick}
    >
      {isConnected ? shortenAddress(wallet?.connected?.address) : 'Sign in'}
      {isConnected && (
        <Box marginLeft={2}>
          {wallet ? <UrlIcon url={wallet.icon} /> : <PulseLoader />}
        </Box>
      )}
    </Button>
  );
}
