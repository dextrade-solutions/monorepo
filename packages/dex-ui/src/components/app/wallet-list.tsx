import {
  Alert,
  Box,
  Button,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuList,
  Typography,
} from '@mui/material';
import { isMobileWeb, shortenAddress } from 'dex-helpers';
import { isEqual } from 'lodash';
import React, { useState } from 'react';

import { ButtonIcon, PulseLoader, UrlIcon } from '../ui';
import { useGlobalModalContext } from './modals';

export default function WalletList({
  value,
  connectingWallet,
  wallets = [],
  connectingWalletLabel = 'Connecting',
  onSelectWallet,
}: {
  value?: WalletConnection; // selected item
  onlyConnected?: boolean;
  connectingWallet?: WalletItem;
  wallets?: any[];
  connectingWalletLabel?: string;
  onSelectWallet?: (item: WalletItem) => void;
}) {
  const [toInstallWallet, setToInstallWallet] = useState<WalletItem>();
  const { showModal } = useGlobalModalContext();
  const onDisconnect = async (item: (typeof wallets)[number]) => {
    showModal({
      name: 'CONFIRM_MODAL',
      title: (
        <Box display="flex" alignItems="center">
          <UrlIcon size={40} url={item.icon} />
          <Typography variant="h5" ml={2}>
            Disconnect {item.name}
          </Typography>
        </Box>
      ),
      onConfirm: () => {
        item.disconnect();
      },
    });
  };

  const showWalletsList = !toInstallWallet && !connectingWallet;

  const pickOrInstallWallet = (item: WalletItem) => {
    // eslint-disable-next-line no-restricted-syntax
    const hasInstalledProp = 'installed' in (item.metadata || {});
    if (!isMobileWeb && hasInstalledProp && !item.metadata.installed) {
      return setToInstallWallet(item);
    }

    return onSelectWallet && onSelectWallet(item);
  };

  const onSelect = (e: Event, wallet: WalletItem) => {
    if (!isMobileWeb || wallet.metadata?.isWebView) {
      e.preventDefault();
      pickOrInstallWallet(wallet);
    }
  };

  return (
    <>
      {!showWalletsList && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          my={2}
        >
          {connectingWallet && (
            <>
              {connectingWallet.name === 'MetaMask' && (
                <Box>
                  <Alert severity="info">
                    Make sure you have the latest version of Metamask app
                  </Alert>
                </Box>
              )}
              <UrlIcon size={40} url={connectingWallet.icon} />
              <Typography my={2}>
                {connectingWalletLabel} {connectingWallet.name}
              </Typography>
              <PulseLoader />
            </>
          )}
          {toInstallWallet && (
            <>
              <UrlIcon size={40} url={toInstallWallet.icon} />
              <Typography my={2}>
                {toInstallWallet.name} is not detected
              </Typography>
              {toInstallWallet.metadata.guide && (
                <Button
                  href={toInstallWallet.metadata.guide.desktop}
                  target="_blank"
                  variant="outlined"
                >
                  Setup guide
                </Button>
              )}
              {toInstallWallet.metadata.downloadLink && (
                <Button
                  sx={{ my: 1 }}
                  variant="contained"
                  href={toInstallWallet.metadata.downloadLink}
                  target="_blank"
                >
                  Install
                </Button>
              )}
            </>
          )}
        </Box>
      )}
      {showWalletsList &&
        wallets.map((item, idx) => (
          <Box data-testid={item.id} key={idx} marginTop={1}>
            <ListItemButton
              sx={{
                bgcolor:
                  item.connected && isEqual(item.connected, value)
                    ? 'secondary.dark'
                    : undefined,
              }}
              className="bordered"
              href={
                item.metadata?.deepLink
                  ? item.metadata.deepLink + window.location.href
                  : undefined
              }
              target="_blank"
              onClick={(e) => onSelect(e, item)}
            >
              {/* {item.metadata && !item.metadata.isSupported && (
                  <ListItemIcon>
                    <Icon name="alert" />
                  </ListItemIcon>
                )} */}
              <ListItemAvatar>
                <UrlIcon size={40} url={item.icon} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex">
                    <Typography>{item.name}</Typography>
                    <Typography color="text.secondary" ml={1}>
                      {item.connectionType}
                    </Typography>
                  </Box>
                }
                secondary={
                  item.connected ? shortenAddress(item.connected.address) : ''
                }
              />
              {item.connected && (
                <ListItemSecondaryAction>
                  <ButtonIcon
                    size="lg"
                    iconName="disconnect"
                    onClick={(e: Event) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDisconnect(item);
                    }}
                  />
                </ListItemSecondaryAction>
              )}
            </ListItemButton>
          </Box>
        ))}
      {!wallets.length && (
        <Typography color="text.secondary">No wallets detected...</Typography>
      )}
    </>
  );
}
