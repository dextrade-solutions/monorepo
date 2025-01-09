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
  ModalProps,
} from 'dex-ui';
import React, { useCallback, useState } from 'react';

import { WalletConnectionType } from '../../../../helpers/constants/wallets';
import { determineConnectionType } from '../../../../helpers/utils/determine-connection-type';
import { WalletItem, useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { WalletConnection } from '../../../../types';
import WalletList from '../../wallet-list';

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

  const onSelectWallet = async (item) => {
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
  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <AssetItem asset={asset} />

        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          ariaLabel={t('close')}
          onClick={hideModal}
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
            <WalletList
              connectingWallet={loadingWallet}
              connectionType={connectionType}
              onSelectWallet={onSelectWallet}
            />
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

export default SetWallet;
