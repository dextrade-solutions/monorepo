import {
  Box,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
} from '@mui/material';
import { WalletConnection, WalletItem } from 'dex-connect'; // Assuming these types are defined elsewhere
import { shortenAddress } from 'dex-helpers';
import { isEqual } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next'; // Make sure you have react-i18next installed

import { ButtonIcon, UrlIcon } from '../../ui'; // Import your custom components

interface WalletListItemProps {
  item: WalletItem;
  value?: WalletConnection;
  deeplinkUrl?: string;
  hideConnectionType: boolean;
  onDisconnect: (item: WalletItem) => void;
  onSelect: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: WalletItem,
  ) => void;
}

const WalletListItem: React.FC<WalletListItemProps> = ({
  item,
  value,
  hideConnectionType,
  deeplinkUrl,
  onDisconnect,
  onSelect,
}) => {
  const { t } = useTranslation(); //  for translations if needed
  const isConnectedAndSelected =
    item.connected && isEqual(item.connected, value);

  return (
    <ListItemButton
      sx={{
        bgcolor: isConnectedAndSelected ? 'secondary.dark' : undefined,
      }}
      className="bordered"
      href={
        item.meta?.getInAppBrowse &&
        item.meta.getInAppBrowse(deeplinkUrl || window.location.href)
      }
      target={item.meta?.deepLink ? '_blank' : undefined} // Only set target if deepLink exists
      onClick={(e) => {
        onSelect(e, item);
      }}
    >
      <ListItemAvatar>
        <UrlIcon
          size={40}
          borderRadius="10px"
          url={item.meta?.icon || item.icon}
          alt={`${item.name} Icon`}
        />{' '}
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            <Typography component="span">{item.name}</Typography>
            {!hideConnectionType &&
              item.connectionType && ( // Only render if connectionType exists
                <Typography component="span" color="text.secondary" ml={1}>
                  {item.connectionType}
                </Typography>
              )}
          </>
        }
        secondary={item.connected ? shortenAddress(item.connected.address) : ''}
      />
      {item.connected && (
        <ListItemSecondaryAction>
          <ButtonIcon
            size="lg"
            iconName="disconnect"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDisconnect(item);
            }}
            title={t('disconnect')}
          />
        </ListItemSecondaryAction>
      )}
    </ListItemButton>
  );
};

export default WalletListItem;
