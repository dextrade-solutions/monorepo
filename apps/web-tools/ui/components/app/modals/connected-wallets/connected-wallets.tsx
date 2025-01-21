import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import { UrlIcon, ButtonIcon, ModalProps, useGlobalModalContext } from 'dex-ui';
import React from 'react';

import { useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import WalletList from '../../wallet-list';

const WalletsList = ({ hideModal }: ModalProps) => {
  const { showModal } = useGlobalModalContext();
  const t = useI18nContext();
  const allWallets = useWallets();
  const wallets = allWallets.filter((w) => w.connected);
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
  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography>Connected wallets</Typography>
        <ButtonIcon
          iconName="close"
          color="secondary"
          ariaLabel={t('close')}
          size="sm"
          onClick={hideModal}
        />
      </Box>

      <Box marginY={1}>
        <Divider />
      </Box>
      <WalletList onlyConnected />
    </Box>
  );
};

export default WalletsList;
