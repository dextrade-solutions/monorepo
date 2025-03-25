import { Paper, Typography } from '@mui/material';
import { Button, useForm } from 'dex-ui'; // Import useForm from dex-ui
import React, { useEffect, useRef } from 'react';

import { useAuth } from '../../../hooks/use-auth';
import { useCurrencies } from '../../../hooks/use-currencies';
import { Preferences } from '../../../services';
import { CurrencyModel, ICurrency } from '../../../types';
import {
  MultiselectAssetsWithValidation,
  VAutocompleteCoin,
} from '../../fields';

interface FormData {
  primaryCoin: ICurrency | null;
  selectedCurrencies: CurrencyModel[];
}

const PredefinedCurrenciesForm = () => {
  const {
    user: { project },
    invoicePreferences,
  } = useAuth();
  const currencies = useCurrencies();
  const isMounted = useRef(false);

  const form = useForm<FormData>({
    // Initialize useForm from dex-ui
    values: {
      primaryCoin: null,
      selectedCurrencies: [],
    },
    method: async (data: FormData) => {
      if (!project?.id) {
        return;
      }
      try {
        await Preferences.save(
          { projectId: project.id },
          {
            converted_coin_id: data.primaryCoin?.id,
            currencies: data.selectedCurrencies.map((asset) => ({
              currency_id: asset.currency.id,
            })),
          },
        );
        console.log('Preferences saved successfully!');
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    },
  });

  useEffect(() => {
    if (
      project?.id &&
      currencies.items.length > 0 &&
      invoicePreferences &&
      !isMounted.current
    ) {
      isMounted.current = true;
      form.setValue('primaryCoin', invoicePreferences.converted_coin_id);
      form.setValue(
        'selectedCurrencies',
        invoicePreferences.currencies
          .map((currency) =>
            currencies.items.find((c) => c.currency.name === currency.name),
          )
          .filter(Boolean), // Filter out undefined values
      );
    }
  }, [project?.id, currencies.items, invoicePreferences, form]);

  return (
    <form onSubmit={form.submit}>
      <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
        <Typography mb={1} fontWeight="bold">
          Primary coin
        </Typography>
        <VAutocompleteCoin name="primaryCoin" form={form} />
      </Paper>
      <MultiselectAssetsWithValidation
        name="selectedCurrencies"
        currencies={currencies.items}
        isLoading={currencies.isLoading}
        form={form}
        data-testid="profile-crypto-currency-select"
      />
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        type="submit"
        disabled={!form.isInitiated}
      >
        Save Changes
      </Button>
    </form>
  );
};

export default PredefinedCurrenciesForm;
