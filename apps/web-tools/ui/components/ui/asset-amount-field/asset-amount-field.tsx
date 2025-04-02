import './index.scss';
import {
  Card,
  TextField,
  CardHeader,
  Typography,
  Box,
  Skeleton,
  CardActionArea,
  Button,
  Divider,
} from '@mui/material';
import {
  formatCurrency,
  formatFundsAmount,
  getCoinIconByUid,
  getStrPaymentMethodInstance,
  shortenAddress,
} from 'dex-helpers';
import { NumericTextField, UrlIcon } from 'dex-ui';
import React from 'react';

import type { useAssetInput } from '../../../hooks/asset/useAssetInput';
import { useI18nContext } from '../../../hooks/useI18nContext';

interface IProps {
  assetInput: ReturnType<typeof useAssetInput>;
  hasValidationErrors: boolean;
  onChange: (v: string | number) => void;
  reserve?: number;
}

export const AssetAmountField = ({ assetInput, onChange, reserve }: IProps) => {
  const { asset, account } = assetInput;
  const displayBalance = Boolean(account);
  const t = useI18nContext();

  const [paymentMethod] = assetInput.paymentMethod || [];
  return (
    <Card
      className="asset-amount-field"
      variant="outlined"
      sx={{ bgcolor: 'primary.light' }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <UrlIcon size={40} url={getCoinIconByUid(asset.uid)} />
            <Box marginLeft={2}>
              <Box alignItems="flex-end">
                <Typography variant="h5" fontWeight="bold">
                  {asset.symbol}
                </Typography>
                {asset.standard && (
                  <Typography>{asset.standard.toUpperCase()}</Typography>
                )}
              </Box>
            </Box>
            <div className="flex-grow" />
            {displayBalance && (
              <Box textAlign="right">
                <Typography variant="body2" fontWeight="bold">
                  {t('Balance')}
                </Typography>
                {assetInput.balance ? (
                  <Card
                    sx={{
                      bgcolor: 'transparent',
                      border: 'none',
                    }}
                    variant="outlined"
                  >
                    <CardActionArea
                      disabled={Boolean(reserve)}
                      onClick={() =>
                        onChange(formatFundsAmount(assetInput.balance.value))
                      }
                    >
                      <Typography component="span" marginRight={1}>
                        {assetInput.balance.formattedValue}
                      </Typography>
                      <Typography component="span">
                        {`(${formatCurrency(assetInput.balance.inUsdt, 'usd')})`}
                      </Typography>
                    </CardActionArea>
                  </Card>
                ) : (
                  <Skeleton width={100} />
                )}
              </Box>
            )}
          </Box>
        }
      />
      <Divider />

      <Box paddingX={2} marginY={1}>
        <NumericTextField
          value={assetInput.amount}
          customInput={TextField}
          disabled={assetInput.loading}
          placeholder="0"
          allowNegative={false}
          fullWidth
          variant="standard"
          valueIsNumericString
          inputProps={{ inputMode: 'decimal' }}
          data-testid={reserve ? 'input-to' : 'input-from'}
          InputProps={{
            disableUnderline: true,
            style: {
              fontSize: 25,
            },
          }}
          onChange={(v) => {
            let value = v;
            if (value.startsWith('.')) {
              value = value.replace('.', '0.');
            }
            onChange(value);
          }}
        />
        {Boolean(assetInput.amount) && asset.priceInUsdt && (
          <Typography
            variant="body2"
            color="text.secondary"
            marginTop={-1}
            marginBottom={2}
          >
            {formatCurrency(
              Number(assetInput.amount) * asset.priceInUsdt,
              'usd',
            )}
          </Typography>
        )}
        {reserve !== undefined && (
          <Box display="flex" marginBottom={2}>
            <Card
              sx={{
                bgcolor: 'transparent',
                border: 'none',
              }}
              variant="outlined"
              onClick={() => onChange(formatFundsAmount(reserve))}
            >
              <CardActionArea>
                <Typography variant="body2">
                  {t('Limit')}: {formatFundsAmount(reserve, asset.symbol)}
                </Typography>
              </CardActionArea>
            </Card>
          </Box>
        )}
      </Box>
      {(assetInput.permissions.canChoosePaymentMethod ||
        assetInput.permissions.canChooseWallet ||
        assetInput.permissions.canPasteWallet) && (
        <Box>
          {assetInput.permissions.canChoosePaymentMethod && (
            <Button
              className="configure-holder-btn"
              sx={{
                bgcolor: 'tertiary.light',
                color: 'text.primary',
              }}
              size="large"
              fullWidth
              disableElevation
              onClick={() => assetInput.showPaymentMethod()}
            >
              {paymentMethod && (
                <Box display="flex">
                  <Box>
                    {getStrPaymentMethodInstance(paymentMethod)}{' '}
                    {assetInput.paymentMethod.length > 1 &&
                      `(+${assetInput.paymentMethod.length - 1})`}
                  </Box>
                </Box>
              )}
              {!paymentMethod && t('Payment method')}
            </Button>
          )}
          {(assetInput.permissions.canPasteWallet ||
            assetInput.permissions.canChooseWallet) && (
            <Button
              className="configure-holder-btn"
              size="large"
              sx={{
                bgcolor: 'tertiary.light',
                color: 'text.primary',
              }}
              disableElevation
              fullWidth
              onClick={() => assetInput.showConfigureWallet()}
            >
              {assetInput.account && (
                <Box display="flex">
                  <Typography textTransform="none">
                    {shortenAddress(assetInput.account.address)}
                  </Typography>
                  <Box marginLeft={2}>
                    <UrlIcon url={assetInput.wallet?.icon} />
                  </Box>
                </Box>
              )}
              {!assetInput.account && t('Set Wallet')}
            </Button>
          )}
        </Box>
      )}
    </Card>
  );
};
