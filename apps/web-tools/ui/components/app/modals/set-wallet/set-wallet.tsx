import { Box, Typography, Button, TextField, Divider } from '@mui/material';
import { determineConnectionType } from 'dex-connect';
import { DEXTRADE_P2P_LINK } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import {
  CopyData,
  ButtonIcon,
  AssetItem,
  ModalProps,
  WalletList,
  Icon,
} from 'dex-ui';
import React, { useState } from 'react';

import { WalletConnectionType } from '../../../../helpers/constants/wallets';
import { getAddressValidator } from '../../../../helpers/utils/get-address-validator';
import { useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { WalletConnection } from '../../../../types';
import { useDisconnectWallet } from '../hooks/use-disconnect-wallet';

const SetWallet = ({
  asset,
  value: savedValue,
  adPath,
  isToAsset,
  onChange,
  hideModal,
}: {
  adPath?: string;
  asset: AssetModel;
  value?: WalletConnection;
  open: boolean;
  isToAsset?: boolean;
  onChange: (v: WalletConnection | null) => void;
} & ModalProps) => {
  const canConnectExternalWallet = !asset.isFiat;
  const canPasteAddress = isToAsset;
  const connectionType = determineConnectionType(asset);
  const wallets = useWallets({ connectionType });
  const disconnectWallet = useDisconnectWallet();
  const addressValidator = getAddressValidator(asset.network, asset.standard);

  const t = useI18nContext();
  const [inputWalletAddress, setInputWalletAddress] = useState('');
  const [loadingWallet, setLoadingWallet] = useState();
  const [value, setValue] = useState<WalletConnection>(savedValue);

  const handleDisconnect = async () => {
    const wallet = wallets.find((w) => w.name === value?.walletName);
    disconnectWallet(wallet);
  };

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
  const inputWalletAddressError = addressValidator(inputWalletAddress);
  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <AssetItem asset={asset} />
        <ButtonIcon
          iconName="close"
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
          <Typography>{t('My current address:')}</Typography>
          <Typography color="text.secondary" variant="body2" marginBottom={1}>
            {t('This address using for')}{' '}
            {isToAsset ? t('receiving') : t('sending')} {asset.symbol}
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
            sx={{ marginBottom: 1 }}
          >
            {t('Change')}
          </Button>
          {value.walletName && (
            <Button
              startIcon={<Icon name="disconnect" />}
              variant="outlined"
              fullWidth
              onClick={handleDisconnect}
            >
              {t('Disconnect Wallet')}
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {canConnectExternalWallet && (
            <WalletList
              wallets={wallets}
              value={savedValue}
              deeplinkUrl={adPath && `${DEXTRADE_P2P_LINK}${adPath}`}
              connectingWallet={loadingWallet}
              onSelectWallet={onSelectWallet}
              hideConnectionType
            />
          )}
          {canPasteAddress && canConnectExternalWallet && (
            <Typography color="text.secondary" marginY={3}>
              {t('OR')}
            </Typography>
          )}
          {canPasteAddress && (
            <Box>
              <Typography marginBottom={1} variant="h6">
                {t('Paste recipient wallet address')}
              </Typography>
              <Box>
                <TextField
                  placeholder={t('Recipient address')}
                  fullWidth
                  size="medium"
                  error={inputWalletAddress && inputWalletAddressError}
                  helperText={inputWalletAddress && inputWalletAddressError}
                  onChange={(v) => setInputWalletAddress(v.target.value)}
                />
                {inputWalletAddress && (
                  <Box marginTop={1}>
                    <Button
                      fullWidth
                      disabled={Boolean(inputWalletAddressError)}
                      variant="contained"
                      onClick={onSetInputWallet}
                    >
                      {t('Attach address')}
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
