import { Box, Typography, Divider } from '@mui/material';
import { ButtonIcon, ModalProps, WalletList } from 'dex-ui';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { clearAuthState } from '../../../../ducks/auth';
import { useWallets } from '../../../../hooks/asset/useWallets';
import { useAuthP2P } from '../../../../hooks/useAuthP2P';
import { useI18nContext } from '../../../../hooks/useI18nContext';
// import WalletList from '../../wallet-list';

const LoginModal = ({
  hideModal,
  onSuccess,
}: { onSuccess: () => void } & ModalProps) => {
  const t = useI18nContext();
  const [loadingWallet, setLoadingWallet] = useState();
  const dispatch = useDispatch();
  const wallets = useWallets();
  const { login } = useAuthP2P();

  const onSelectWallet = useCallback(
    async (item: (typeof wallets)[number]) => {
      setLoadingWallet(item);
      try {
        if (item.name === 'Wallet Connect') {
          await item.disconnect();
        }
        dispatch(clearAuthState());
        await login({
          walletId: item.id,
        });
        hideModal();
        onSuccess && onSuccess();
      } catch (e) {
        console.error(e);
        setLoadingWallet(null);
      }
    },
    [hideModal, login, dispatch, onSuccess],
  );
  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography>Login via wallet</Typography>

        <ButtonIcon
          iconName="close"
          color="secondary"
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
          connectingWalletLabel="Login via"
          onSelectWallet={onSelectWallet}
        />
      </Box>
    </Box>
  );
};

export default LoginModal;
