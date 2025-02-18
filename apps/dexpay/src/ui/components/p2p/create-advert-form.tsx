import { Box, Button } from '@mui/material';
import { useForm } from 'dex-ui';
import React from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation, useQuery } from '../../hooks/use-query';
import { Pairs, DexTrade } from '../../services'; // Adjust path as needed
import { Validation } from '../../validation';
import { TextFieldWithValidation } from '../fields';

const CreateAdvertForm = () => {
  const { user } = useAuth();
  const projectId = user?.project?.id!;

  const advCreate = useMutation(DexTrade.advertCreateFromPair);
  const pairsQuery = useQuery(Pairs.list, [{ projectId }]);

  const form = useForm({
    values: {
      pairId: 0,
      exchangersPolicy: '',
      minimumExchangeAmountCoin1: null,
      maximumExchangeAmountCoin1: '',
      priceAdjustment: '',
      transactionFee: '',
    },
    validationSchema: Validation.DexTrade.Advert.create,
    method: (values) => advCreate.mutateAsync([{ projectId }, values]),
  });

  if (pairsQuery.isLoading) {
    return <p>Loading trading pairs...</p>;
  }

  return (
    <Box component="form" onSubmit={form.submit} noValidate sx={{ mt: 1 }}>
      <TextFieldWithValidation
        margin="normal"
        fullWidth
        label="Exchangers Policy"
        name="exchangersPolicy"
        form={form}
        onChange={(e) => e.target.value}
      />

      <TextFieldWithValidation
        margin="normal"
        fullWidth
        label="Minimum Exchange Amount"
        type="number"
        name="minimumExchangeAmountCoin1"
        form={form}
        onChange={(e) => e.target.value}
      />

      <TextFieldWithValidation
        margin="normal"
        fullWidth
        label="Maximum Exchange Amount (Coin 1)"
        type="number"
        form={form}
        name="maximumExchangeAmountCoin1"
        onChange={(e) => e.target.value}
      />

      <TextFieldWithValidation
        margin="normal"
        fullWidth
        label="Price Adjustment"
        type="number"
        form={form}
        name="priceAdjustment"
        onChange={(e) => e.target.value}
      />

      <TextFieldWithValidation
        margin="normal"
        fullWidth
        label="Transaction Fee"
        type="number"
        form={form}
        name="transactionFee"
        onChange={(e) => e.target.value}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={Boolean(form.primaryError)}
        sx={{ mt: 3, mb: 2 }}
      >
        Create Advert
      </Button>
    </Box>
  );
};

export default CreateAdvertForm;
