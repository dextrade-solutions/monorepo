import '../styles.scss';
import { Box, Typography, Divider, Alert, Button } from '@mui/material';
import { formatFundsAmount } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { CopyData, ButtonIcon, AssetItem } from 'dex-ui';
import { useEffect } from 'react';
import QRCode from 'react-qr-code';

import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { useAssetBalance } from '../../../../hooks/asset/useAssetBalance';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ModalProps } from '../types';

const DepositWallet = ({
  asset,
  awaitingDepositAmount,
  address,
  manualConfirmation,
  description,
  onClose,
  onSuccess,
  hideModal,
}: {
  asset: AssetModel;
  address: string;
  description?: string;
  manualConfirmation?: boolean;
  awaitingDepositAmount?: number;
  onSuccess?: () => void;
  onClose?: () => void;
} & ModalProps) => {
  const t = useI18nContext();
  const balance = useAssetBalance(asset, address);

  useEffect(() => {
    if (
      !manualConfirmation &&
      onSuccess &&
      awaitingDepositAmount &&
      Number(balance?.value) > awaitingDepositAmount
    ) {
      onSuccess();
    }
  }, [balance, awaitingDepositAmount, manualConfirmation, onSuccess]);

  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Box>
          <AssetItem asset={asset} />
          {balance?.formattedValue && (
            <Typography marginTop={1}>
              Balance: {balance.formattedValue}
            </Typography>
          )}
        </Box>
        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={() => hideModal(onClose)}
          ariaLabel={t('close')}
        />
      </Box>
      <Box marginY={1}>
        <Divider />
      </Box>
      <Box>
        {awaitingDepositAmount && (
          <Alert severity="info">
            {description && <Box>{description}</Box>}

            <Typography marginTop={1} fontWeight={900}>
              Deposit amount:{' '}
              {formatFundsAmount(awaitingDepositAmount, asset.symbol)}
            </Typography>
          </Alert>
        )}
        <Box
          display="flex"
          alignItems="center"
          marginBottom={3}
          flexDirection="column"
        >
          <Typography marginY={1}>Deposit address:</Typography>
          <QRCode height={280} value={address} />
          <CopyData tooltipPosition="top" width="100%" data={address} />
        </Box>
      </Box>
      {manualConfirmation && onSuccess && (
        <Box display="flex">
          <Button onClick={() => hideModal(onClose)}>Cancel</Button>
          <div className="flex-grow"></div>
          <Button
            variant="contained"
            onClick={async () => {
              hideModal();
              onSuccess();
            }}
          >
            Confirm I sent
          </Button>
        </Box>
      )}
    </Box>
  );
};

const DepositWalletComponent = withModalProps(DepositWallet);

export default DepositWalletComponent;
