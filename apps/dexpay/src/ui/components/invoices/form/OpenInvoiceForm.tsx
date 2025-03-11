import { Box, Typography } from '@mui/material';
import { Button, CircleNumber, useForm } from 'dex-ui';
import React from 'react';

import { useCurrencies } from '../../../hooks/use-currencies';
import { MultiselectAssetsWithValidation, VPickCoin } from '../../fields';

export default function OpenInvoice() {
  const currencies = useCurrencies();
  const form = useForm({
    values: {
      convertedCurrencies: [],
    },
    method: () => {
      // TODO: Create open invoice
    },
  });
  return (
    <Box>
      <Box my={2} alignItems="center">
        <Typography color="text.tertiary" fontWeight="bold">
          Open invoice
        </Typography>
        <Typography color="text.secondary">Choose a currencies</Typography>
      </Box>

      <MultiselectAssetsWithValidation
        name="convertedCurrencies"
        currencies={currencies.items}
        isLoading={currencies.isLoading}
        form={form}
        data-testid="invoice-create-crypto-currency-select"
      />
      <Button
        type="submit"
        disabled={!form.isInitiated || Boolean(form.primaryError)}
        fullWidth
        size="large"
        variant="contained"
        gradient
        sx={{ mt: 3, mb: 2 }}
        data-testid="invoice-create-submit-button"
      >
        {form.primaryError || 'Create'}
      </Button>
    </Box>
  );
}
