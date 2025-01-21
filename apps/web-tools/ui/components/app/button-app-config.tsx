import {
  Box,
  Button,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import {
  ButtonIcon,
  PulseLoader,
  useGlobalModalContext,
  UrlIcon,
  Icon,
} from 'dex-ui';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

import { getCurrentTheme, setTheme } from '../../ducks/app/app';
import {
  KYC_ROUTE,
  PAYMENT_METHODS_ROUTE,
  PLANS_ROUTE,
  SETTINGS_GENERAL_ROUTE,
  SWAPS_HISTORY_ROUTE,
} from '../../helpers/constants/routes';
import { useAuthP2P } from '../../hooks/useAuthP2P';
import { useAuthWallet } from '../../hooks/useAuthWallet';

export default function ButtonAppConfig() {
  const { logout } = useAuthP2P();
  const { showModal } = useGlobalModalContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wallet, isAuthenticated } = useAuthWallet();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const login = () => {
    showModal({ name: 'LOGIN_MODAL' });
  };

  const currentTheme = useSelector(getCurrentTheme);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isDarkMode =
    currentTheme === 'system' ? prefersDarkMode : currentTheme === 'dark';
  const toggleDarkMode = () => {
    const toggleValue = isDarkMode ? 'light' : 'dark';
    dispatch(setTheme(toggleValue));
  };

  return (
    <>
      <ButtonIcon
        iconName="setting-dex"
        size="lg"
        iconProps={{
          color: 'text.primary',
        }}
        onClick={onClick}
      />
      <Menu
        anchorEl={anchorEl}
        variant="selectedMenu"
        open={open}
        onClose={handleClose}
      >
        {isAuthenticated ? (
          <MenuItem>
            <ListItem sx={{ display: 'flex' }}>
              <ListItemIcon>
                {wallet ? <UrlIcon url={wallet.icon} /> : <PulseLoader />}
              </ListItemIcon>
              <ListItemText sx={{ mr: 2 }}>
                {shortenAddress(wallet?.connected?.address)}
              </ListItemText>
              <ListItemSecondaryAction>
                <ButtonIcon
                  size="lg"
                  iconName="disconnect"
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </MenuItem>
        ) : (
          <MenuItem onClick={login}>
            <ListItem>
              <ListItemIcon>
                <Icon name="link" />
              </ListItemIcon>
              <ListItemText>Auth wallet</ListItemText>
            </ListItem>
          </MenuItem>
        )}
        <MenuItem onClick={() => navigate(SWAPS_HISTORY_ROUTE)}>
          <ListItem>
            <ListItemIcon>
              <Icon name="menu" />
            </ListItemIcon>
            <ListItemText>Activity</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem onClick={() => navigate(SETTINGS_GENERAL_ROUTE)}>
          <ListItem>
            <ListItemIcon>
              <Icon name="setting-dex" />
            </ListItemIcon>
            <ListItemText>General</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem onClick={() => navigate(PAYMENT_METHODS_ROUTE)}>
          <ListItem>
            <ListItemIcon>
              <Icon name="setting-dex-2" />
            </ListItemIcon>
            <ListItemText>Payment methods</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem onClick={() => navigate(KYC_ROUTE)}>
          <ListItem>
            <ListItemIcon>
              <Icon name="info" />
            </ListItemIcon>
            <ListItemText>KYC</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem onClick={() => navigate(PLANS_ROUTE)}>
          <ListItem>
            <ListItemIcon>
              <Icon name="card" />
            </ListItemIcon>
            <ListItemText>Upgrade</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem onClick={toggleDarkMode}>
          <ListItem>
            <ListItemIcon>
              <DarkModeSwitch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                moonColor="white"
                sunColor="dark"
              />
            </ListItemIcon>
            <ListItemText>
              {isDarkMode ? 'Light mode' : 'Dark mode'}
            </ListItemText>
          </ListItem>
        </MenuItem>
      </Menu>
    </>
  );
}
