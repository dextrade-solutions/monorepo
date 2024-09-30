import {
  Card,
  CardContent,
  TextField,
  CardHeader,
  Typography,
  Box,
  InputAdornment,
  Skeleton,
  CardActionArea,
} from '@mui/material';
import { formatCurrency, formatFundsAmount } from 'dex-helpers';
import React from 'react';
import { NumericFormat } from 'react-number-format';
import { useAccount } from 'wagmi';

import { AssetInputValue, AssetModel } from '../../../../app/types/p2p-swaps';
import { getCoinIconByUid } from '../../../helpers/utils/tokens';
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
}

export const AssetAmountField: React.FC<IProps> = ({
  asset,
  balance,
  value = {
    amount: '',
    paymentMethod: null,
    recepientAddress: null,
    loading: false,
  },
  onChange,
  reserve,
}) => {
  const { isConnected } = useAccount();
  const updateValue = (field: string, v: any) => {
    onChange({
      ...value,
      [field]: v,
    });
  };
  return (
    <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <UrlIcon size={40} url={getCoinIconByUid(asset.uid)} />
            <Box marginLeft={2}>
              <Typography>{asset.symbol}</Typography>
              {!asset.isNative && (
                <Typography color="text.secondary" variant="body2">
                  {asset.standard.toUpperCase()}
                </Typography>
              )}
            </Box>
            <Box className="flex-grow"></Box>
            {isConnected && asset.chainId && !asset.isFiat && (
              <Box textAlign="right" onClick={() => {}}>
                <Typography color="text.secondary" variant="body2">
                  Balance:
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
                      <Typography
                        as="span"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        {formatCurrency(balance.inUsdt, 'usd')}
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
      <Box paddingX={2} marginBottom={1}>
        <NumericFormat
          value={value.amount}
          customInput={TextField}
          disabled={value.loading}
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
        {!asset.chainId && !asset.isFiat && (
          <Box marginBottom={2}>
            <TextField
              placeholder="Recepient address"
              fullWidth
              onChange={(e) => updateValue('recepientAddress', e.target.value)}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
};
