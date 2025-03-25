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
import assetDict from 'dex-helpers/assets-dict';
import { shortenAddress } from 'dex-helpers';
import {
  ButtonIcon,
  PulseLoader,
  useGlobalModalContext,
  UrlIcon,
  Icon,
} from 'dex-ui';
import { Percent } from 'lucide-react';
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
import { useI18nContext } from '../../hooks/useI18nContext';
import { WalletConnection } from '../../types';
import { paymentService } from 'dex-services';

export default function ButtonAppConfig() {
  const { logout } = useAuthP2P();
  const { showModal } = useGlobalModalContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wallet, isAuthenticated } = useAuthWallet();
  const t = useI18nContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const login = () => {
    setAnchorEl(null);
    showModal({ name: 'LOGIN_MODAL' });
  };

  const dextradeEarn = () => {
    const currency = assetDict.ARB;
    showModal({
      name: 'SET_WALLET',
      asset: currency,
      onChange: async (v: WalletConnection) => {
        await paymentService.subscribeAddress({
          address: v.address,
          currency: 'ETH_ARB',
        });
        window.location.href = 'http://dextrade.fija.finance';
      },
    });
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
        data-testid="settings"
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
            <ListItem
              sx={{ display: 'flex' }}
              data-testid="settings-wallet-connected"
            >
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
          <MenuItem onClick={login} data-testid="settings-wallet-login">
            <ListItem>
              <ListItemIcon>
                <Icon name="link" />
              </ListItemIcon>
              <ListItemText>{t('auth-wallet')}</ListItemText>
            </ListItem>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => navigate(SWAPS_HISTORY_ROUTE)}
          data-testid="settings-swap-history"
        >
          <ListItem>
            <ListItemIcon>
              <Icon name="menu" />
            </ListItemIcon>
            <ListItemText>{t('activity')}</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem onClick={dextradeEarn} data-testid="settings-earn">
          <ListItem>
            <ListItemIcon>
              <Percent />
            </ListItemIcon>
            <ListItemText>{t('Dextrade Earn')}</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem
          onClick={() => navigate(SETTINGS_GENERAL_ROUTE)}
          data-testid="settings-general"
        >
          <ListItem>
            <ListItemIcon>
              <Icon name="setting-dex" />
            </ListItemIcon>
            <ListItemText>{t('general')}</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem
          onClick={() => navigate(PAYMENT_METHODS_ROUTE)}
          data-testid="settings-payment-methods"
        >
          <ListItem>
            <ListItemIcon>
              <Icon name="setting-dex-2" />
            </ListItemIcon>
            <ListItemText>{t('payment-methods')}</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem
          onClick={() => navigate(KYC_ROUTE)}
          data-testid="settings-kyc"
        >
          <ListItem>
            <ListItemIcon>
              <Icon name="info" />
            </ListItemIcon>
            <ListItemText>{t('kyc')}</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem
          onClick={() => navigate(PLANS_ROUTE)}
          data-testid="settings-plans"
        >
          <ListItem>
            <ListItemIcon>
              <Icon name="card" />
            </ListItemIcon>
            <ListItemText>{t('upgrade')}</ListItemText>
          </ListItem>
        </MenuItem>
        <MenuItem onClick={toggleDarkMode} data-testid="settings-theme">
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
              {isDarkMode ? t('light-mode') : t('dark-mode')}
            </ListItemText>
          </ListItem>
        </MenuItem>
      </Menu>
    </>
  );
}
