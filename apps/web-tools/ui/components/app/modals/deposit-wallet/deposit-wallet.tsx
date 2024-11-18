import '../styles.scss';
import { Box, Typography, Divider, Alert } from '@mui/material';
import { formatFundsAmount } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { CopyData, ButtonIcon, AssetItem } from 'dex-ui';
import { useEffect } from 'react';

import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { useAssetBalance } from '../../../../hooks/asset/useAssetBalance';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ModalProps } from '../types';

const DepositWallet = ({
  asset,
  awaitingDepositAmount,
  address,
  onSuccess,
  hideModal,
}: {
  asset: AssetModel;
  address: string;
  awaitingDepositAmount?: number;
  onSuccess?: () => void;
} & ModalProps) => {
  const t = useI18nContext();
  const balance = useAssetBalance(asset, address);

  useEffect(() => {
    if (
      onSuccess &&
      awaitingDepositAmount &&
      Number(balance?.value) > awaitingDepositAmount
    ) {
      onSuccess();
    }
  }, [balance, awaitingDepositAmount, onSuccess]);

  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Box>
          <AssetItem asset={asset} />
          {balance && (
            <Typography marginTop={1}>
              Balance: {balance?.formattedValue}
            </Typography>
          )}
        </Box>
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
        {awaitingDepositAmount && (
          <Alert severity="info">
            To start the swap, you need to deposit the native token{' '}
            {formatFundsAmount(awaitingDepositAmount, asset.symbol)}
          </Alert>
        )}
        <Typography marginTop={2}>Deposit address:</Typography>
        <Box marginBottom={3}>
          <CopyData tooltipPosition="top" width="100%" data={address} />
        </Box>
      </Box>
    </Box>
  );
};

const DepositWalletComponent = withModalProps(DepositWallet);

export default DepositWalletComponent;
