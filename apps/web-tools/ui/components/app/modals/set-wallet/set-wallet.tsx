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
import { shortenAddress } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import {
  CopyData,
  UrlIcon,
  ButtonIcon,
  AssetItem,
  PulseLoader,
  withModalProps,
  ModalProps,
} from 'dex-ui';
import { useCallback, useState } from 'react';

import { WalletConnectionType } from '../../../../helpers/constants/wallets';
import { determineConnectionType } from '../../../../helpers/utils/determine-connection-type';
import { WalletItem, useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { WalletConnection } from '../../../../types';

type ConfiguredWallet = { address: string; icon: string };

const SetWallet = ({
  asset,
  value: savedValue,
  isToAsset,
  onChange,
  hideModal,
}: {
  asset: AssetModel;
  value: WalletConnection | null;
  open: boolean;
  isToAsset?: boolean;
  onChange: (v: WalletConnection | null) => void;
} & ModalProps) => {
  const canConnectExternalWallet = !asset.isFiat;
  const canPasteAddress = isToAsset;
  const connectionType = determineConnectionType(asset);

  const t = useI18nContext();
  const wallets = useWallets({ connectionType });
  const [inputWalletAddress, setInputWalletAddress] = useState('');
  const [loadingWallet, setLoadingWallet] = useState();
  const [value, setValue] = useState<ConfiguredWallet | null>(savedValue);

  const onSetInputWallet = () => {
    onChange({
      address: inputWalletAddress,
      connectionType: WalletConnectionType.manual,
      walletName: '',
    });
    hideModal();
  };

  const onSelectWallet = async (item: (typeof wallets)[number]) => {
    let result: WalletConnection;
    setLoadingWallet(item);
    try {
      if (item.connected) {
        result = item.connected;
      } else {
        result = await item.connect();
      }
      onChange(result);
      hideModal();
    } catch {
      setLoadingWallet(null);
    }
  };
  const onDisconnect = useCallback(
    async (item: WalletItem) => {
      if (item.name === savedValue?.walletName) {
        onChange(null);
        hideModal();
      }
      await item.disconnect();
    },
    [hideModal, onChange, savedValue],
  );
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
              {loadingWallet ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                >
                  <UrlIcon size={40} url={loadingWallet.icon} />
                  <Typography my={2}>
                    {loadingWallet.name} connecting
                  </Typography>
                  <PulseLoader />
                </Box>
              ) : (
                <MenuList>
                  <Typography variant="h6">Connect wallet</Typography>
                  {wallets.map((item, idx) => (
                    <Box data-testid={item.id} key={idx} marginTop={1}>
                      <ListItemButton
                        sx={{
                          backgroundcolor: 'secondary.dark',
                          borderWidth:
                            savedValue?.walletName === item.name ? 1 : 0,
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
                      No supported wallets detected...
                    </Typography>
                  )}
                </MenuList>
              )}
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
                Paste recipient wallet address
              </Typography>
              <Box>
                <TextField
                  placeholder="Recipient address"
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
