import {
  alpha,
  Box,
  Grid,
  Grow,
  keyframes,
  styled,
  Typography,
} from '@mui/material';
import currencies from 'currency-formatter/currencies';
import assetDict from 'dex-helpers/assets-dict';
import { AssetItem, Button } from 'dex-ui';
import React, { useState } from 'react';

import NumpadInput from '../components/ui/NumpadInput';
import PickCoin from '../components/ui/PickCoin';
import { useAuth } from '../hooks/use-auth';

const DEFAULT_ASSETS = ['USDT_TRX', 'USDT_BSC', 'USDT_ETH', 'BTC', 'ETH'].map(
  (c) => assetDict[c],
);

export default function Terminal() {
  const { user, setPrimaryCurrency } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedAsset, setAsset] = useState();

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

  const primaryCurrency = user?.primaryCurrency;

  let currency = currencies.find((c) => c.code === primaryCurrency);
  if (!currency) {
    currency = {
      symbol: primaryCurrency,
      symbolOnLeft: false,
    };
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '90vh', // Make container take up full viewport height
        justifyContent: 'center', // Vertically center content
        alignItems: 'center', // Horizontally center content
      }}
    >
      <Typography
        position="absolute"
        color="tertiary.contrastText"
        sx={{ top: 40 }}
      >
        Dex<strong>Pay Terminal</strong>
      </Typography>
      {primaryCurrency && (
        <>
          <AnimatedValue
            color="tertiary.contrastText"
            sx={{
              opacity: amount ? 1 : 0.5,
            }}
            variant="h4"
            my={2}
            display="flex"
          >
            {amount && (
              <Box mr={1} sx={{ opacity: 0.5 }}>
                {currency.symbol}
              </Box>
            )}
            {amount || 'Enter Amount'}
          </AnimatedValue>

          <NumpadInput maxWidth={400} value={amount} onChange={setAmount} />
          <Grid mt={2} container spacing={1}>
            {DEFAULT_ASSETS.map((asset) => (
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
              <Button color="tertiary" fullWidth>
                Others
              </Button>
            </Grid>
          </Grid>
          <Grow in={Boolean(amount) && Boolean(selectedAsset)}>
            <Box mt={4} maxWidth={400} width="100%">
              <Button
                fullWidth
                gradient
                sx={{
                  height: 43,
                }}
              >
                Continue
              </Button>
            </Box>
          </Grow>
        </>
      )}
      {!primaryCurrency && (
        <>
          <Typography
            mb={4}
            color="tertiary.contrastText"
            variant="h6"
            fontWeight="bold"
            textAlign="center"
          >
            Please, set primary currency
          </Typography>
          <Box
            width="100%"
            sx={{
              boxShadow: '0px 0px 20px 0px #0000001A',
              borderRadius: 1,
              bgcolor: 'background.default',
              p: 2,
            }}
          >
            <PickCoin value={primaryCurrency} onChange={setPrimaryCurrency} />
          </Box>
        </>
      )}
    </Box>
  );
}
