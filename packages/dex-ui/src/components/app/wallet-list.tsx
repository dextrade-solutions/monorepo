import {
  Alert,
  Box,
  Button,
  Grow,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material';
import { WalletConnection, WalletItem } from 'dex-connect';
import { isMobileWeb, shortenAddress } from 'dex-helpers';
import { isEqual } from 'lodash';
import { useState } from 'react';

import { ButtonIcon, PulseLoader, UrlIcon } from '../ui';
import { useGlobalModalContext } from './modals';

export default function WalletList({
  value,
  wallets = [],
  hideConnectionType,
  connectingWalletLabel = 'Connecting',
  onSelectWallet,
}: {
  value?: WalletConnection; // selected item
  wallets?: any[];
  hideConnectionType: boolean;
  connectingWalletLabel?: string;
  onSelectWallet?: (item: WalletItem) => void;
}) {
  const [connectingWallet, setConnectingWallet] = useState<WalletItem>();
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

  const pickOrInstallWallet = async (item: WalletItem) => {
    // eslint-disable-next-line no-restricted-syntax
    const hasInstalledProp = 'installed' in (item.meta || {});
    if (!isMobileWeb && hasInstalledProp && !item.meta.installed) {
      return setToInstallWallet(item);
    }

    if (onSelectWallet) {
      setConnectingWallet(item);
      await onSelectWallet(item);
      setConnectingWallet(null);
    }
  };

  const onSelect = (e: Event, wallet: WalletItem) => {
    if (
      !isMobileWeb ||
      wallet.meta?.isWebView ||
      wallet.meta?.supportMobileBrowser
    ) {
      e.preventDefault();
      pickOrInstallWallet(wallet);
    }
  };

  let renderList = wallets;
  if (!isMobileWeb) {
    renderList = renderList.filter((i) => !i.meta?.onlyMobile);
  }

  const webViewWallet = renderList.filter((i) => i.meta?.isWebView);
  if (webViewWallet.length) {
    renderList = webViewWallet;
  }

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
          {connectingWallet?.name === 'MetaMask' && (
            <Box mb={2}>
              <Alert severity="info">
                Make sure you have the latest version of Metamask app
              </Alert>
            </Box>
          )}
          {connectingWallet && (
            <>
              <UrlIcon
                size={40}
                borderRadius="10px"
                url={connectingWallet.icon}
              />
              <Typography my={1}>
                {connectingWalletLabel} {connectingWallet.name}
              </Typography>
              <Box my={1}>
                <PulseLoader />
              </Box>
            </>
          )}
          {toInstallWallet && (
            <>
              <UrlIcon
                size={40}
                borderRadius="10px"
                url={toInstallWallet.icon}
              />
              <Typography my={1}>
                {toInstallWallet.name} is not detected
              </Typography>
              {toInstallWallet.meta.downloadLink && (
                <Button
                  sx={{ my: 1 }}
                  variant="contained"
                  href={toInstallWallet.meta.downloadLink}
                  target="_blank"
                >
                  Install
                </Button>
              )}
            </>
          )}
          <Button
            sx={{ mt: 1 }}
            color="secondary"
            variant="outlined"
            onClick={() => {
              setToInstallWallet(null);
              setConnectingWallet(null);
            }}
          >
            Cancel
          </Button>
        </Box>
      )}
      {showWalletsList &&
        renderList.map((item, idx) => (
          <Grow in={true} timeout={600 * (idx / 2)}>
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
                  item.meta?.deepLink
                    ? item.meta.deepLink + window.location.href
                    : undefined
                }
                target="_blank"
                onClick={(e) => onSelect(e, item)}
              >
                <ListItemAvatar>
                  <UrlIcon size={40} borderRadius="10px" url={item.icon} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex">
                      <Typography>{item.name}</Typography>
                      {!hideConnectionType && (
                        <Typography color="text.secondary" ml={1}>
                          {item.connectionType}
                        </Typography>
                      )}
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
          </Grow>
        ))}
      {!renderList.length && (
        <Typography color="text.secondary">No wallets detected...</Typography>
      )}
    </>
  );
}
