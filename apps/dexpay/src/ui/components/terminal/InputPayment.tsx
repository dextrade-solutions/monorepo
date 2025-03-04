import {
  Box,
  Chip,
  Grid,
  Grow,
  IconButton,
  keyframes,
  styled,
  Typography,
} from '@mui/material';
import { AssetModel } from 'dex-helpers/types';
import { AssetItem, Button, useGlobalModalContext } from 'dex-ui';
import { XIcon } from 'lucide-react';
import React from 'react';

import { useCurrencies } from '../../hooks/use-currencies';
import NumpadInput from '../ui/NumpadInput';

const DEFAULT_ASSETS = ['USDT_TRX', 'USDT_BSC', 'USDT_ETH', 'BTC', 'ETH'];

interface InputPaymentProps {
  amount: string;
  isLoading?: boolean;
  setAmount: (amount: string) => void;
  selectedAsset?: AssetModel; // Assuming 'any' for now, define a more specific type if possible
  setAsset: (asset?: AssetModel) => void; // Assuming 'any' for now, define a more specific type if possible
  primaryCurrency: string | undefined;
  setPrimaryCurrency: (currency: string) => void;
  onConfirm: () => void;
  currency: {
    symbol: string;
    symbolOnLeft: boolean;
  };
}

const numberAnimation = keyframes`
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.1);
    }
    `;
const AnimatedValue = styled(Typography)`
  animation: ${numberAnimation} 0.1s linear;
  transition: transform 0.1s;
  &:active {
    transform: scale(0.95);
  }
`;

export default function InputPayment({
  amount,
  setAmount,
  selectedAsset,
  setAsset,
  isLoading,
  primaryCurrency,
  setPrimaryCurrency,
  onConfirm,
  currency,
}: InputPaymentProps) {
  const { showModal } = useGlobalModalContext();
  const currencies = useCurrencies({ disableLoadBalances: true });
  const allCurrencies = currencies.items.map((c) => ({
    ...c.asset,
    currencyId: c.currency.id,
  }));

  const mostUsedCurrencies = allCurrencies.filter((c) =>
    DEFAULT_ASSETS.includes(c.iso),
  );

  return (
    <>
      <AnimatedValue
        color="tertiary.contrastText"
        sx={{
          opacity: amount ? 1 : 0.5,
        }}
        variant="h4"
        my={2}
        display="flex"
        onClick={() =>
          showModal({
            name: 'PICK_COIN',
            value: primaryCurrency,
            onChange: setPrimaryCurrency,
          })
        }
      >
        {amount && (
          <Box mr={1} sx={{ opacity: 0.5 }}>
            {currency.symbol}
          </Box>
        )}
        {amount || 'Enter Amount'}
      </AnimatedValue>

      <NumpadInput maxWidth={400} value={amount} onChange={setAmount} />
      {selectedAsset ? (
        <Chip
          label={<AssetItem asset={selectedAsset} />}
          sx={{
            mt: 5,
            height: 50,
          }}
          onDelete={() => setAsset()}
          onClick={() => setAsset()}
        ></Chip>
      ) : (
        <Grid mt={2} container spacing={1}>
          {mostUsedCurrencies.map((asset) => (
            <Grid item xs={4} key={asset.iso}>
              <Button
                fullWidth
                variant={
                  selectedAsset?.iso === asset.iso ? 'contained' : 'text'
                }
                color="tertiary"
                onClick={() => setAsset(asset)}
              >
                <AssetItem asset={asset} />
              </Button>
            </Grid>
          ))}

          <Grid item xs={4}>
            <Button
              color="tertiary"
              fullWidth
              onClick={() => {
                showModal({
                  name: 'ASSET_SELECT',
                  items: allCurrencies.filter(
                    (c) => !DEFAULT_ASSETS.includes(c.iso),
                  ),
                  value: selectedAsset,
                  onChange: setAsset,
                });
              }}
            >
              Others
            </Button>
          </Grid>
        </Grid>
      )}
      <Grow in={Boolean(amount) && Boolean(selectedAsset)}>
        <Box mt={4} maxWidth={400} width="100%">
          <Button
            fullWidth
            gradient
            disabled={isLoading}
            sx={{
              height: 43,
            }}
            onClick={onConfirm}
          >
            Continue
          </Button>
        </Box>
      </Grow>
    </>
  );
}
