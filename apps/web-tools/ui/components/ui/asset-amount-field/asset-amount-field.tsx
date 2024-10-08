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
import { useEffect, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';

import SetWallet from '../../app/modals/set-wallet';
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
  value: AssetInputValue;
  onChange: (_v: AssetInputValue) => void;
  reserve?: number;
  disabled: boolean;
}

export const AssetAmountField = ({
  asset,
  balance,
  value = {
    amount: '',
    paymentMethod: null,
    configuredWallet: null,
    loading: false,
  },
  disabled,
  onChange,
  reserve,
}: IProps) => {
  const [openSetWallet, setOpenSetWallet] = useState(false);
  const updateValue = (field: string, v: any) => {
    onChange({
      ...value,
      [field]: v,
    });
  };
  const inputRef = useRef(null);
  const isSolanaInput = asset.network === NetworkNames.solana;
  const showSetWallet = !asset.chainId && !asset.isFiat;
  const { connected: isSolanaWalletConnected } = useWallet();
  const displayBalance =
    (isSolanaInput && isSolanaWalletConnected) ||
    (asset.chainId && !asset.isFiat);
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);
  return (
    <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
      <SetWallet
        asset={asset}
        value={value.configuredWallet}
        open={openSetWallet}
        onChange={(v) => updateValue('configuredWallet', v)}
        onClose={() => setOpenSetWallet(false)}
      />
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
                        onClick={() => updateValue('amount', balance.value)}
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
                <Button
                  variant="outlined"
                  onClick={() => setOpenSetWallet(true)}
                >
                  {value.configuredWallet && (
                    <Box display="flex">
                      {shortenAddress(value.configuredWallet.address)}
                      <Box marginLeft={2}>
                        <UrlIcon url={value.configuredWallet.icon} />
                      </Box>
                    </Box>
                  )}
                  {!value.configuredWallet && 'Set wallet'}
                </Button>
              )}
            </Box>
          </Box>
        }
      />
      <Divider />

      <Box paddingX={2} marginY={1}>
        <NumericFormat
          value={value.amount}
          customInput={TextField}
          disabled={value.loading || disabled}
          decimalSeparator=","
          placeholder="0"
          fullWidth
          variant="standard"
          valueIsNumericString
          InputProps={{
            inputRef,
            disableUnderline: true,
            style: {
              fontSize: 25,
            },
            endAdornment: (
              <InputAdornment position="end">
                {Number(value.amount) > 0 && !value.loading && (
                  <ButtonIcon
                    iconName="close"
                    color="secondary"
                    size="sm"
                    onClick={() => updateValue('amount', '')}
                  />
                )}
              </InputAdornment>
            ),
          }}
          onChange={(e) =>
            updateValue('amount', e.target.value.replace(',', '.'))
          }
        />
        {Boolean(value.amount) && asset.priceInUsdt && (
          <Typography
            variant="body2"
            color="text.secondary"
            marginTop={-1}
            marginBottom={2}
          >
            {formatCurrency(Number(value.amount) * asset.priceInUsdt, 'usd')}
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
              onClick={() => updateValue('amount', reserve)}
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
