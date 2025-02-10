import { Box, Typography, Divider } from '@mui/material';
import { UrlIcon, ButtonIcon, ModalProps, useGlobalModalContext, WalletList } from 'dex-ui';
import React from 'react';

import { useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const WalletsList = ({ hideModal }: ModalProps) => {
  const t = useI18nContext();
  const allWallets = useWallets();
  const wallets = allWallets.filter((w) => w.connected);
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
      <WalletList wallets={wallets} />
    </Box>
  );
};

export default WalletsList;
