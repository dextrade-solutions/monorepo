import {
  Box,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuList,
  Typography,
} from '@mui/material';
import { isMobileWeb, shortenAddress, WalletConnectionType } from 'dex-helpers';
import {
  ButtonIcon,
  PulseLoader,
  UrlIcon,
  useGlobalModalContext,
} from 'dex-ui';
import React from 'react';

import { useWallets, WalletItem } from '../../hooks/asset/useWallets';

export default function WalletList({
  connectingWallet,
  connectingWalletLabel = 'Connecting',
  connectionType,
  onSelectWallet,
}: {
  connectingWallet: WalletItem;
  connectionType?: WalletConnectionType[];
  connectingWalletLabel?: string;
  onSelectWallet: (item: WalletItem) => void;
}) {
  const { showModal } = useGlobalModalContext();
  const wallets = useWallets({
    connectionType,
  });
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
    <>
      {connectingWallet ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <UrlIcon size={40} url={connectingWallet.icon} />
          <Typography my={2}>
            {connectingWalletLabel} {connectingWallet.name}
          </Typography>
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
                href={isMobileWeb ? item.metadata?.deepLink : undefined}
                onClick={() => onSelectWallet(item)}
              >
                <div>{isMobileWeb}</div>
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
      )}
    </>
  );
}
