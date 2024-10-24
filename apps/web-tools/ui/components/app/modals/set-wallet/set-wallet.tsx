import '../styles.scss';
import {
  Box,
  Typography,
  Button,
  MenuList,
  ListItemText,
  TextField,
  ListItemSecondaryAction,
  Divider,
  ListItemButton,
  ListItemAvatar,
} from '@mui/material';
import { NetworkNames, shortenAddress } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { CopyData, UrlIcon, ButtonIcon } from 'dex-ui';
import { useState } from 'react';

import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { WalletItem, useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { AssetAccount } from '../../../../types';
import AssetItem from '../../../ui/asset-item';
import { ModalProps } from '../types';

type ConfiguredWallet = { address: string; icon: string };

const SetWallet = ({
  asset,
  value: savedValue,
  isToAsset,
  onChange,
  hideModal,
}: {
  asset: AssetModel;
  value: AssetAccount | null;
  open: boolean;
  isToAsset?: boolean;
  onChange: (v: AssetAccount | null) => void;
} & ModalProps) => {
  const canConnectExternalWallet = !asset.isFiat;
  const canPasteAddress = isToAsset;

  const t = useI18nContext();
  const wallets = useWallets({ asset });
  const [inputWalletAddress, setInputWalletAddress] = useState('');
  const [value, setValue] = useState<ConfiguredWallet | null>(savedValue);

  const onSetInputWallet = () => {
    onChange({ address: inputWalletAddress, icon: '' });
    hideModal();
  };

  const onSelectWallet = async (item: (typeof wallets)[number]) => {
    let result: AssetAccount;
    if (item.connected) {
      result = item.connected;
    } else {
      result = await item.connect();
    }
    onChange(result);
    hideModal();
  };
  const onDisconnect = (item: WalletItem) => {
    item.disconnect();
    if (item.connected === value) {
      onChange(null);
      hideModal();
    }
  };
  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <AssetItem asset={asset} />

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
      {value?.address ? (
        <Box>
          <Typography>My current address:</Typography>
          <Typography color="text.secondary" variant="body2" marginBottom={1}>
            This address using for {isToAsset ? 'receiving' : 'sending'}{' '}
            {asset.symbol}
          </Typography>
          <Box marginBottom={3}>
            <CopyData tooltipPosition="top" width="100%" data={value.address} />
          </Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setValue(null);
            }}
          >
            Change
          </Button>
        </Box>
      ) : (
        <Box>
          {canConnectExternalWallet && (
            <>
              <Typography variant="h6">Connect wallet</Typography>
              <MenuList>
                {wallets.map((item, idx) => (
                  <Box key={idx} marginTop={1}>
                    <ListItemButton
                      sx={{ backgroundColor: 'secondary.dark' }}
                      className="bordered"
                      onClick={() => onSelectWallet(item)}
                    >
                      <ListItemAvatar>
                        <UrlIcon size={40} url={item.icon} />
                      </ListItemAvatar>

                      <ListItemText
                        primary={item.name}
                        secondary={
                          item.connected
                            ? shortenAddress(item.connected.address)
                            : ''
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
                    No solana wallets detected...
                  </Typography>
                )}
              </MenuList>
            </>
          )}
          {canPasteAddress && canConnectExternalWallet && (
            <Typography color="text.secondary" marginY={3}>
              OR
            </Typography>
          )}
          {canPasteAddress && (
            <Box>
              <Typography marginBottom={1} variant="h6">
                Paste recepient wallet address
              </Typography>
              <Box>
                <TextField
                  placeholder="Recepient address"
                  fullWidth
                  size="medium"
                  onChange={(v) => setInputWalletAddress(v.target.value)}
                />
                {inputWalletAddress && (
                  <Box marginTop={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={onSetInputWallet}
                    >
                      Attach address
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

const SetWalletComponent = withModalProps(SetWallet);

export default SetWalletComponent;
