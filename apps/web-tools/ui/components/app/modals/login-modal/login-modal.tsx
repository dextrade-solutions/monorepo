import { Box, Typography, Divider } from '@mui/material';
import { ButtonIcon, ModalProps, WalletList } from 'dex-ui';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { clearAuthState } from '../../../../ducks/auth';
import { useWallets } from '../../../../hooks/asset/useWallets';
import { AuthType, useAuthP2P } from '../../../../hooks/useAuthP2P';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const LoginModal = ({
  hideModal,
  onSuccess,
}: { onSuccess: () => void } & ModalProps) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const wallets = useWallets();
  const { login } = useAuthP2P();
  const [loadingWallet, setLoadingWallet] =
    useState<(typeof wallets)[number]>();

  const onSelectWallet = useCallback(
    async ({
      item,
      type,
    }: {
      item: (typeof wallets)[number];
      type: AuthType;
    }) => {
      setLoadingWallet(item);
      try {
        if (item.name === 'Wallet Connect') {
          await item.disconnect();
        }
        dispatch(clearAuthState());
        await login({
          type,
          walletId: item.id,
          credentialResponse: item.credentialResponse,
        });
        hideModal();
        onSuccess && onSuccess();
      } catch (e) {
        console.error(e);
        setLoadingWallet(undefined);
      }
    },
    [hideModal, login, dispatch, onSuccess],
  );

  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography>{t('login-via-wallet')}</Typography>

        <ButtonIcon
          iconName="close"
          size="sm"
          onClick={hideModal}
          ariaLabel={t('close')}
        />
      </Box>

      <Box marginY={1}>
        <Divider />
      </Box>

      <Box>
        <WalletList
          wallets={wallets}
          connectingWallet={loadingWallet}
          connectingWalletLabel={t('login-via')}
          onSelectWallet={(item) =>
            onSelectWallet({ item, type: AuthType.connectedWallet })
          }
        />
      </Box>
    </Box>
  );
};

export default LoginModal;
