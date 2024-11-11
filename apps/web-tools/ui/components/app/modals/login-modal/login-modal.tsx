import '../styles.scss';
import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemAvatar,
} from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import { UrlIcon, ButtonIcon } from 'dex-ui';
import React from 'react';

import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { useWallets } from '../../../../hooks/asset/useWallets';
import { useAuthP2P } from '../../../../hooks/useAuthP2P';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ModalProps } from '../types';

const LoginModal = ({ hideModal }: ModalProps) => {
  const t = useI18nContext();
  const wallets = useWallets();
  const auth = useAuthP2P();

  const onSelectWallet = async (item: (typeof wallets)[number]) => {
    if (item.connected) {
      await item.disconnect();
    }
    await item.connect();
    await auth({
      wallet: item.name,
    });
    hideModal();
  };
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
        <MenuList>
          {wallets.map((item, idx) => (
            <Box key={idx} marginTop={1}>
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

                <ListItemText
                  primary={item.name}
                  secondary={
                    item.connected ? shortenAddress(item.connected.address) : ''
                  }
                />
              </ListItemButton>
            </Box>
          ))}
          {!wallets.length && (
            <Typography color="text.secondary">
              No wallets detected...
            </Typography>
          )}
        </MenuList>
      </Box>
    </Box>
  );
};

const LoginModalComponent = withModalProps(LoginModal);

export default LoginModalComponent;
