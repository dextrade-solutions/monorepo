import { Box, Button, Menu, MenuItem } from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import { PulseLoader, UrlIcon } from 'dex-ui';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { showModal } from '../../ducks/app/app';
import {
  SETTINGS_ROUTE,
  SWAPS_HISTORY_ROUTE,
} from '../../helpers/constants/routes';
import { useAuthP2P } from '../../hooks/useAuthP2P';
import { useAuthWallet } from '../../hooks/useAuthWallet';

export default function WalletConnectButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      dispatch(showModal({ name: 'LOGIN_MODAL' }));
    }
  };

  return (
    <>
      <Button
        variant={isAuthenticated ? '' : 'contained'}
        disableElevation
        sx={{
          backgroundImage: isAuthenticated
            ? undefined
            : 'linear-gradient(-68deg, #00C283 12%, #3C76FF 87%)',
        }}
        onClick={onClick}
      >
        {isAuthenticated
          ? shortenAddress(wallet?.connected?.address)
          : 'Sign in'}
        {isAuthenticated && (
          <Box marginLeft={2}>
            {wallet ? <UrlIcon url={wallet.icon} /> : <PulseLoader />}
          </Box>
        )}
      </Button>
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
