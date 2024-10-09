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
  shortenAddress,
} from 'dex-helpers';
import { AssetInputValue, AssetModel } from 'dex-helpers/types';
import React, { useEffect, useRef } from 'react';
import { NumericFormat } from 'react-number-format';

import { ButtonIcon } from '../button-icon';
import UrlIcon from '../url-icon';

interface IProps {
  asset: AssetModel;
  balance: {
    amount: bigint;
    value: string;
    formattedValue: string;
    inUsdt: number | null;
  } | null;
  amount: string | number;
  disabled: boolean;
  configuredWallet: { address: string; icon?: string } | null;
  onChange: (_v: AssetInputValue) => void;
  onSetWalletClick: () => void;
  reserve?: number;
}

export const AssetAmountField = ({
  asset,
  balance,
  amount,
  disabled,
  configuredWallet,
  onChange,
  onSetWalletClick,
  reserve,
}: IProps) => {
  const isSolanaInput = asset.network === NetworkNames.solana;
  const showSetWallet = !asset.chainId && !asset.isFiat;
  const { connected: isSolanaWalletConnected } = useWallet();
  const displayBalance =
    (isSolanaInput && isSolanaWalletConnected) ||
    (asset.chainId && !asset.isFiat);
  return (
    <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <UrlIcon size={40} url={getCoinIconByUid(asset.uid)} />
            <Box marginLeft={2}>
              <Box display="flex" alignItems="flex-end">
                <Typography variant="h5" fontWeight="bold">
                  {asset.symbol}
                </Typography>
                {!asset.isNative && (
                  <Typography
                    variant="h5"
                    marginLeft={1}
                    color="text.secondary"
                  >
                    {asset.standard.toUpperCase()}
                  </Typography>
                )}
              </Box>
              {displayBalance && (
                <Box marginTop={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Balance
                  </Typography>
                  {balance ? (
                    <Card
                      sx={{
                        bgcolor: 'transparent',
                        border: 'none',
                      }}
                      variant="outlined"
                    >
                      <CardActionArea
                        disabled={Boolean(reserve)}
                        onClick={() => onChange(balance.value)}
                      >
                        <Typography
                          as="span"
                          color="text.secondary"
                          marginRight={1}
                        >
                          {balance.formattedValue}
                        </Typography>
                        <Typography as="span" color="text.secondary">
                          {`(${formatCurrency(balance.inUsdt, 'usd')})`}
                        </Typography>
                      </CardActionArea>
                    </Card>
                  ) : (
                    <Skeleton width={100} />
                  )}
                </Box>
              )}
            </Box>
            <Box className="flex-grow"></Box>
            <Box>
              {showSetWallet && (
                <Button variant="outlined" onClick={() => onSetWalletClick()}>
                  {configuredWallet && (
                    <Box display="flex">
                      {shortenAddress(configuredWallet.address)}
                      <Box marginLeft={2}>
                        <UrlIcon url={configuredWallet.icon} />
                      </Box>
                    </Box>
                  )}
                  {!configuredWallet && 'Set wallet'}
                </Button>
              )}
            </Box>
          </Box>
        }
      />
      <Divider />

      <Box paddingX={2} marginY={1}>
        <NumericFormat
          value={amount}
          customInput={TextField}
          disabled={disabled}
          decimalSeparator=","
          placeholder="0"
          fullWidth
          variant="standard"
          valueIsNumericString
          InputProps={{
            disableUnderline: true,
            style: {
              fontSize: 25,
            },
            endAdornment: (
              <InputAdornment position="end">
                {Number(amount) > 0 && !disabled && (
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
        {Boolean(amount) && asset.priceInUsdt && (
          <Typography
            variant="body2"
            color="text.secondary"
            marginTop={-1}
            marginBottom={2}
          >
            {formatCurrency(Number(amount) * asset.priceInUsdt, 'usd')}
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
    </Card>
  );
};
