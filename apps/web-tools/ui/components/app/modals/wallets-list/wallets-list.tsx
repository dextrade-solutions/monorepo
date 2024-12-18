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
import { UrlIcon, ButtonIcon, ModalProps, withModalProps } from 'dex-ui';
import React from 'react';
import { useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const WalletsList = ({ hideModal }: ModalProps) => {
  const t = useI18nContext();
  const allWallets = useWallets();
  const wallets = allWallets.filter((w) => w.connected);
  const onDisconnect = async (item: (typeof wallets)[number]) => {
    await item.disconnect();
  };
  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography>Connected wallets</Typography>

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
            <Box data-testid={item.id} key={idx} marginTop={1}>
              <ListItemButton
                sx={{
                  backgroundcolor: 'secondary.dark',
                }}
                className="bordered"
                onClick={() => onDisconnect(item)}
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
                {item.connected && (
                  <ListItemSecondaryAction>
                    <ButtonIcon
                      size="lg"
                      iconName="disconnect"
                      onClick={(e) => {
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
            <Typography color="text.secondary">
              No wallets detected...
            </Typography>
          )}
        </MenuList>
      </Box>
    </Box>
  );
};

const WalletsListComponent = withModalProps(WalletsList);

export default WalletsListComponent;
