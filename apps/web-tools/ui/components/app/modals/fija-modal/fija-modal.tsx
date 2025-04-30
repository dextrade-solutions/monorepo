import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Connection, WalletConnectionType } from 'dex-connect';
import assetDict from 'dex-helpers/assets-dict';
import { AssetModel } from 'dex-helpers/types';
import { paymentService } from 'dex-services';
import {
  AssetItem,
  Autocomplete,
  ButtonIcon,
  ModalProps,
  WalletList,
} from 'dex-ui';
import React, { useState } from 'react';

import { useWallets } from '../../../../hooks/asset/useWallets';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const STRATEGIES = {
  ETH: ['crvUSD CurveConvex', 'ETH CurveConvex'],
  ETH_ARB: ['ETH GMXv2', 'wBTC GMXv2', 'USDC AaveOpt', 'USDC GMXv2'],
} as const;

const FijaModal = ({ hideModal }: { onSuccess: () => void } & ModalProps) => {
  const t = useI18nContext();
  const [step, setStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<AssetModel>();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const wallets = useWallets({
    connectionType: [WalletConnectionType.eip6963],
  });

  const handleNetworkChange = (_, v: AssetModel) => {
    setSelectedAsset(v);
    setSelectedStrategy(''); // Reset strategy when network changes
    setStep(2);
  };

  const handleStrategyChange = (_, v: string) => {
    setSelectedStrategy(v);
    setStep(3);
  };

  const handleWalletSelect = async (wallet: Connection) => {
    const result = await wallet.connect();
    try {
      await paymentService.subscribeAddress({
        address: result.address,
        currency: selectedAsset?.iso,
        strategy: [selectedStrategy],
      });
      hideModal();
      window.location.href = 'http://dextrade.fija.finance';
    } catch (error) {
      console.error('Failed to subscribe address:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box>
            <FormControl fullWidth>
              <Autocomplete
                disableSearch
                renderOption={(_, option) => <AssetItem asset={option} />}
                // getOptionLabel={(option) => {
                //   debugger;
                // }}
                options={[assetDict.ETH, assetDict.ETH_ARB]}
                paper
                value={selectedAsset}
                onChange={handleNetworkChange}
              />
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box>
            <FormControl fullWidth>
              <Autocomplete
                disableSearch
                options={STRATEGIES[selectedAsset?.iso]}
                paper
                value={selectedStrategy}
                onChange={handleStrategyChange}
              />
            </FormControl>
          </Box>
        );
      case 3:
        return (
          <Box>
            <WalletList
              wallets={wallets}
              hideConnectionType
              onSelectWallet={handleWalletSelect}
              connectingWalletLabel={t('Connecting to')}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box padding={5}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">
          {step === 1 && t('Step 1: Select Network')}
          {step === 2 && t('Step 2: Select Strategy')}
          {step === 3 && t('Step 3: Select Wallet')}
        </Typography>
        <ButtonIcon
          iconName="close"
          size="sm"
          onClick={hideModal}
          ariaLabel={t('close')}
        />
      </Box>

      <Box marginY={1}>
        <Divider />
      </Box>

      {renderStep()}
    </Box>
  );
};

export default FijaModal;
