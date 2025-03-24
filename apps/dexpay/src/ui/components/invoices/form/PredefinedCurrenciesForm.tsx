import { Button, useForm } from 'dex-ui'; // Import useForm from dex-ui
import React, { useEffect, useRef } from 'react';

import { useAuth } from '../../../hooks/use-auth';
import { useCurrencies } from '../../../hooks/use-currencies';
import { Preferences } from '../../../services';
import { MultiselectAssetsWithValidation } from '../../fields';

interface FormData {
  selectedCurrencies: ReturnType<typeof useCurrencies>['items'];
}

const PredefinedCurrenciesForm = () => {
  const {
    user: { project },
  } = useAuth();
  const currencies = useCurrencies();
  const isMounted = useRef(false);

  const form = useForm<FormData>({
    // Initialize useForm from dex-ui
    values: {
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
            currencies: data.selectedCurrencies.map((currency) => ({
              currency_id: currency.currency.id,
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
    if (project?.id && currencies.items.length > 0 && !isMounted.current) {
      isMounted.current = true;
      Preferences.getMy({ projectId: project.id })
        .then((data) => {
          form.setValue(
            'selectedCurrencies',
            data.currencies
              .map((currency) =>
                currencies.items.find((c) => c.currency.name === currency.name),
              )
              .filter(Boolean), // Filter out undefined values
          );
        })
        .catch((error) => {
          console.error('Error fetching preferences:', error);
        });
    }
  }, [project?.id, currencies.items, form]);

  return (
    <form onSubmit={form.submit}>
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
