import { Box, Button } from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import { PulseLoader, UrlIcon } from 'dex-ui';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { showModal } from '../../ducks/app/app';
import { getAuth } from '../../ducks/auth';
import { SETTINGS_ROUTE } from '../../helpers/constants/routes';

export default function WalletConnectButton() {
  // eslint-disable-next-line no-shadow
  const account = useAccount();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authData = useSelector(getAuth);
  const isConnected = account.isConnected && authData.apikey;
  const walletInfo = account.connector;

  const onClick = () => {
    if (isConnected) {
      navigate(SETTINGS_ROUTE);
    } else {
      dispatch(showModal({ name: 'LOGIN_MODAL' }));
    }
  };

  return (
    <Button
      variant={isConnected ? 'outlined' : 'contained'}
      disableElevation
      sx={{
        backgroundImage: isConnected
          ? undefined
          : 'linear-gradient(-68deg, #00C283 12%, #3C76FF 87%)',
      }}
      onClick={onClick}
    >
      {isConnected ? shortenAddress(account.address) : 'Sign in'}
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
