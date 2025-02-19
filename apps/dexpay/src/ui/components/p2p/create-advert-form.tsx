import { Box, Button, Paper, Typography } from '@mui/material';
import { CircleNumber, SelectCoinsSwap, useForm } from 'dex-ui';
import React from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation } from '../../hooks/use-query';
import { Pairs, DexTrade } from '../../services'; // Adjust path as needed
import { Validation } from '../../validation';
import {
  SelectCurrencyWithValidation,
  TextFieldWithValidation,
} from '../fields';

const CreateAdvertForm = () => {
  const { user } = useAuth();
  const projectId = user?.project?.id!;

  const advCreate = useMutation(DexTrade.advertCreateFromPair);
  const pairsCreate = useMutation(Pairs.create);

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
    method: async (values) => {
      await pairsCreate.mutateAsync([
        { projectId },
        {
          currency_main_id: values.coin1.currency.id,
          currency_secondary_id: values.coin2.currency.id,
        },
      ]);
      advCreate.mutateAsync([{ projectId }, values]);
    },
  });

  return (
    <Box component="form" onSubmit={form.submit} noValidate sx={{ mt: 1 }}>
      <Box display="flex" my={1} alignItems="center">
        <CircleNumber number={1} color="tertiary.main" />
        <Typography ml={1}>Pair selection</Typography>
      </Box>
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'secondary.dark',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box zIndex={1}>
          <Typography fontWeight="bold">
            <SelectCurrencyWithValidation
              placeholder="I send"
              name="coin1"
              form={form}
            />
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            width: '100%',
          }}
        >
          <SelectCoinsSwap />
        </Box>
        <Box ml={1}>
          <Typography fontWeight="bold">
            <SelectCurrencyWithValidation
              placeholder="I get"
              name="coin2"
              reversed
              form={form}
            />
          </Typography>
        </Box>
      </Paper>
      <Box display="flex" mt={4} alignItems="center">
        <CircleNumber number={2} color="tertiary.main" />
        <Typography ml={1}>Ad options</Typography>
      </Box>
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
        {form.primaryError || 'Create Advert'}
      </Button>
    </Box>
  );
};

export default CreateAdvertForm;
