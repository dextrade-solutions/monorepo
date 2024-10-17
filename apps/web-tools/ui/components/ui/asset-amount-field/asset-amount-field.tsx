import './index.scss';
import {
  Card,
  TextField,
  CardHeader,
  Typography,
  Box,
  InputAdornment,
  Skeleton,
  CardActionArea,
  Button,
  Divider,
} from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  NetworkNames,
  formatCurrency,
  formatFundsAmount,
  getCoinIconByUid,
  getStrPaymentMethodInstance,
  shortenAddress,
} from 'dex-helpers';
import { ButtonIcon, UrlIcon } from 'dex-ui';
import _ from 'lodash';
import { NumericFormat } from 'react-number-format';

import type { useAssetInput } from '../../../hooks/asset/useAssetInput';

interface IProps {
  assetInput: ReturnType<typeof useAssetInput>;
  onChange: (v: string | number) => void;
  reserve?: number;
}

export const AssetAmountField = ({ assetInput, onChange, reserve }: IProps) => {
  const { asset } = assetInput;
  const isSolanaInput = asset.network === NetworkNames.solana;
  const { connected: isSolanaWalletConnected } = useWallet();
  const displayBalance =
    (isSolanaInput && isSolanaWalletConnected) ||
    (asset.chainId && !asset.isFiat);
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
                {!asset.isNative && (
                  <Typography color="text.secondary">
                    {asset.standard.toUpperCase()}
                  </Typography>
                )}
              </Box>
            </Box>
            <div className="flex-grow" />
            {displayBalance && (
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  Balance
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
                      onClick={() => onChange(assetInput.balance.value)}
                    >
                      <Typography
                        as="span"
                        color="text.secondary"
                        marginRight={1}
                      >
                        {assetInput.balance.formattedValue}
                      </Typography>
                      <Typography as="span" color="text.secondary">
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
        <NumericFormat
          value={assetInput.amount}
          customInput={TextField}
          disabled={assetInput.loading}
          decimalSeparator=","
          placeholder="0"
          allowNegative={false}
          fullWidth
          variant="standard"
          valueIsNumericString
          InputProps={{
            disableUnderline: true,
            style: {
              fontSize: 25,
            },
            autoComplete: 'off',
            endAdornment: (
              <InputAdornment position="end">
                {Number(assetInput.amount) > 0 && !assetInput.loading && (
                  <ButtonIcon
                    iconName="close"
                    color="secondary"
                    size="sm"
                    onClick={() => onChange('')}
                  />
                )}
              </InputAdornment>
            ),
          }}
          onChange={(e) => onChange(e.target.value.replace(',', '.'))}
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
              onClick={() => onChange(reserve)}
            >
              <CardActionArea>
                <Typography variant="body2">
                  Limit: {formatFundsAmount(reserve, asset.symbol)}
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
              variant="contained"
              color="tertiary"
              size="large"
              fullWidth
              disableElevation
              onClick={() => assetInput.showPaymentMethod()}
            >
              {assetInput.paymentMethod && (
                <Box display="flex">
                  <Box>
                    {getStrPaymentMethodInstance(assetInput.paymentMethod)}
                  </Box>
                </Box>
              )}
              {!assetInput.paymentMethod && 'Payment method'}
            </Button>
          )}
          {(assetInput.permissions.canPasteWallet ||
            assetInput.permissions.canChooseWallet) && (
            <Button
              className="configure-holder-btn"
              size="large"
              variant="contained"
              color="tertiary"
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
                    <UrlIcon url={assetInput.account.icon} />
                  </Box>
                </Box>
              )}
              {!assetInput.account && 'Set Wallet'}
            </Button>
          )}
        </Box>
      )}
    </Card>
  );
};
