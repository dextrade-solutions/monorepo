import { Box, Button, Menu, MenuItem } from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import {
  ButtonIcon,
  PulseLoader,
  useGlobalModalContext,
  UrlIcon,
} from 'dex-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  SETTINGS_ROUTE,
  SWAPS_HISTORY_ROUTE,
} from '../../helpers/constants/routes';
import { useAuthP2P } from '../../hooks/useAuthP2P';
import { useAuthWallet } from '../../hooks/useAuthWallet';

export default function WalletConnectButton() {
  const { showModal } = useGlobalModalContext();
  const navigate = useNavigate();
  const { wallet, isAuthenticated } = useAuthWallet();
  const { logout } = useAuthP2P();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClick = (event: any) => {
    if (isAuthenticated) {
      setAnchorEl(event.currentTarget);
    } else {
      showModal({ name: 'LOGIN_MODAL' });
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <Button variant="" disableElevation onClick={onClick}>
          {shortenAddress(wallet?.connected?.address)}
          <Box marginLeft={2}>
            {wallet ? <UrlIcon url={wallet.icon} /> : <PulseLoader />}
          </Box>
        </Button>
      ) : (
        <ButtonIcon iconName="login" size="lg" onClick={onClick} />
      )}
      <Menu
        anchorEl={anchorEl}
        variant="selectedMenu"
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => navigate(SWAPS_HISTORY_ROUTE)}>
          Activity
        </MenuItem>
        <MenuItem onClick={() => navigate(SETTINGS_ROUTE)}>Settings</MenuItem>
        <MenuItem
          onClick={() => {
            logout();
            handleClose();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
