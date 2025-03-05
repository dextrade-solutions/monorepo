import { Alert, Box, Button, Grow, Typography } from '@mui/material';
import { Connection, WalletConnection } from 'dex-connect';
import { isMobileWeb } from 'dex-helpers';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import WalletListItem from './wallet-list-item';
import { PulseLoader, UrlIcon } from '../../ui';
import { useGlobalModalContext } from '../modals';

export default function WalletList({
  value,
  wallets = [],
  hideConnectionType,
  connectingWalletLabel = 'Connecting',
  onSelectWallet,
  connectingWallet,
}: {
  value?: WalletConnection; // selected item
  wallets?: Connection[];
  hideConnectionType?: boolean;
  connectingWalletLabel?: string;
  onSelectWallet?: (item: Connection) => void;
  connectingWallet?: Connection;
}) {
  const { t } = useTranslation();
  const [toInstallWallet, setToInstallWallet] = useState<Connection>();
  const { showModal } = useGlobalModalContext();
  const onDisconnect = async (item: (typeof wallets)[number]) => {
    showModal({
      name: 'CONFIRM_MODAL',
      title: (
        <Box display="flex" alignItems="center">
          <UrlIcon size={40} url={item.icon} />
          <Typography variant="h5" ml={2}>
            {t('disconnectWallet', { name: item.name })}
          </Typography>
        </Box>
      ),
      onConfirm: () => {
        item.disconnect();
      },
    });
  };

  const showWalletsList = !toInstallWallet && !connectingWallet;

  const pickOrInstallWallet = async (item: Connection) => {
    // eslint-disable-next-line no-restricted-syntax
    const hasInstalledProp = 'installed' in (item.meta || {});
    if (!isMobileWeb && hasInstalledProp && !item.meta.installed) {
      return setToInstallWallet(item);
    }

    if (onSelectWallet) {
      
      await onSelectWallet(item);
      
    }
  };

  const onSelect = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    wallet: Connection,
  ) => {
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
                {t('metamaskLatestVersion')}
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
                {t('walletNotDetected', { name: toInstallWallet.name })}
              </Typography>
              {toInstallWallet.meta.downloadLink && (
                <Button
                  sx={{ my: 1 }}
                  variant="contained"
                  href={toInstallWallet.meta.downloadLink}
                  target="_blank"
                >
                  {t('install')}
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
            }}
          >
            {t('cancel')}
          </Button>
        </Box>
      )}
      {showWalletsList &&
        renderList.map((item, idx) => (
          <Grow in={true} key={item.id} timeout={600 * (idx / 2)}>
            <Box data-testid={item.id}>
              <WalletListItem
                item={item}
                value={value}
                hideConnectionType={hideConnectionType}
                onDisconnect={onDisconnect}
                onSelect={onSelect}
              />
            </Box>
          </Grow>
        ))}
      {!renderList.length && (
        <Typography color="text.secondary">
          {t('noWalletsDetected')}
        </Typography>
      )}
    </>
  );
}
