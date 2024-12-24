import '../styles.scss';
import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemAvatar,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import { UrlIcon, ButtonIcon, PulseLoader } from 'dex-ui';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { clearAuthState } from '../../../../ducks/auth';
import { WalletConnectionType } from '../../../../helpers/constants/wallets';
import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { useWallets } from '../../../../hooks/asset/useWallets';
import { useAuthP2P } from '../../../../hooks/useAuthP2P';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ModalProps } from '../types';

const LoginModal = ({ hideModal }: ModalProps) => {
  const t = useI18nContext();
  const [loadingWallet, setLoadingWallet] = useState();
  const dispatch = useDispatch();
  const wallets = useWallets({
    connectionType: [WalletConnectionType.eip6963],
  });
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
      } catch (e) {
        console.error(e);
        setLoadingWallet(null);
      }
    },
    [hideModal, login, dispatch],
  );
  const renderList = loadingWallet
    ? wallets.filter((i) => i.name === loadingWallet.name)
    : wallets;
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
        <Box>
          <Alert severity="info">
            Make sure you have the latest version of Metamask app
          </Alert>
        </Box>
        {loadingWallet ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <UrlIcon size={40} url={loadingWallet.icon} />
            <Typography my={2}>Signing in via {loadingWallet.name}</Typography>
            <PulseLoader />
          </Box>
        ) : (
          <MenuList>
            {wallets.map((item, idx) => (
              <Box data-testid={item.id} key={idx} marginTop={1}>
                <ListItemButton
                  sx={{
                    backgroundcolor: 'secondary.dark',
                  }}
                  className="bordered"
                  onClick={() => onSelectWallet(item)}
                >
                  <ListItemAvatar>
                    <UrlIcon size={40} url={item.icon} />
                  </ListItemAvatar>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </Box>
            ))}
            {!wallets.length && (
              <Typography color="text.secondary">
                No wallets detected...
              </Typography>
            )}
          </MenuList>
        )}
      </Box>
    </Box>
  );
};

const LoginModalComponent = withModalProps(LoginModal);

export default LoginModalComponent;
