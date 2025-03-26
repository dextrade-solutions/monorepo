import {
  Box,
  Typography,
  FormLabel,
  AccordionDetails,
  AccordionSummary,
  Accordion,
  FormControlLabel,
} from '@mui/material';
import dayjs from 'dayjs';
import { queryClient } from 'dex-helpers/shared';
import {
  CircleNumber,
  Icon,
  useForm,
  Button,
} from 'dex-ui';
import { map } from 'lodash';
import React, { useEffect, useRef } from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import { ROUTE_INVOICE_DETAIL, ROUTE_MERCHANT } from '../../../constants/pages';
import { useAuth } from '../../../hooks/use-auth';
import { useCurrencies } from '../../../hooks/use-currencies';
import { useMutation } from '../../../hooks/use-query';
import { Invoice, Preferences } from '../../../services';
import { CurrencyModel, ICurrency } from '../../../types';
import { Validation } from '../../../validation';
import {
  DatePickerWithValidation,
  MultiselectAssetsWithValidation,
  TextFieldWithValidation,
  VCheckbox,
} from '../../fields';
import SelectCoinAmount from '../../ui/SelectCoinAmount';

interface InvoiceData {
  overrideShortcut: boolean;
  primaryCoin: {
    amount: number | null;
    coin: ICurrency | null;
  };
  convertedCurrencies: CurrencyModel[];
  description: string;
  dueDate: dayjs.Dayjs | null;
}

const CreateInvoiceForm = () => {
  const [, navigate] = useHashLocation();
  const { user, invoicePreferences } = useAuth();

  const projectId = user?.project.id!;

  const currencies = useCurrencies();
  const isMounted = useRef(false);

  const invoiceCreate = useMutation(Invoice.create, {
    onSuccess: (data) => {
      navigate(
        `${ROUTE_INVOICE_DETAIL.replace(':id', `${data.public_id}:${data.id}`)}`,
      );
    },
  });

  const prefQueryKey = [Preferences.getMy.toString()];
  const savePreferencesMutation = useMutation(Preferences.save, {
    onMutate: async () => {
      queryClient.refetchQueries({ queryKey: prefQueryKey });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: prefQueryKey });
    },
  });

  const form = useForm<InvoiceData>({
    values: {
      overrideShortcut: true,
      primaryCoin: {
        amount: null,
        coin: null,
      },
      convertedCurrencies: [],
      description: '',
      dueDate: null,
    },
    validationSchema: Validation.Invoice.create,
    method: async (values) => {
      event.preventDefault();
      if (!user) {
        throw new Error('no user exists');
      }
      const dueToEndOfDay = values.dueDate
        ? new Date(
            new Date(values.dueDate.toDate()).setUTCHours(23, 59, 59, 999),
          ).toISOString()
        : undefined;
      const primaryCoinId =
        typeof values.primaryCoin.coin === 'number'
          ? values.primaryCoin.coin
          : values.primaryCoin.coin.id;

      const currenciesIds = map(values.convertedCurrencies, 'currency.id');

      const body = {
        description: values.description || undefined,
        due_to: dueToEndOfDay,
        converted_amount_requested: values.primaryCoin?.amount,
        converted_coin_id: primaryCoinId,
        amount_requested: undefined,
        currency_id: undefined,
        coin_id: undefined,
        ...(values.convertedCurrencies.length
          ? {
              supported_currencies: currenciesIds,
            }
          : {}),
      };
      await invoiceCreate.mutateAsync([{ projectId }, body]);
      if (values.overrideShortcut) {
        await savePreferencesMutation.mutateAsync([
          { projectId },
          {
            converted_coin_id: primaryCoinId,
            currencies: currenciesIds.map((id) => ({ currency_id: id })),
          },
        ]);
      }
    },
  });

  useEffect(() => {
    if (
      !isMounted.current &&
      projectId &&
      currencies.items.length > 0 &&
      invoicePreferences
    ) {
      isMounted.current = true;
      form.setValue('primaryCoin', {
        amount: null,
        coin: invoicePreferences.converted_coin_id,
      });
      form.setValue(
        'convertedCurrencies',
        invoicePreferences.currencies
          .map((currency) =>
            currencies.items.find((c) => c.currency.name === currency.name),
          )
          .filter(Boolean), // Filter out undefined values
      );
    }
  }, [projectId, isMounted, currencies.items, invoicePreferences, form]);

  return (
    <Box
      component="form"
      onSubmit={form.submit}
      noValidate
      sx={{ mt: 1 }}
      data-testid="invoice-create-form"
    >
      <Box my={1} display="flex" alignItems="center">
        <CircleNumber color="tertiary.main" number={1} />
        <Typography ml={1} color="text.secondary">
          Primary coin
        </Typography>
      </Box>
      <SelectCoinAmount
        form={form}
        name="primaryCoin"
        data-testid="invoice-create-primary-coin-select"
      />
      <Box mt={3} display="flex" alignItems="center">
        <CircleNumber color="tertiary.main" number={2} />
        <Typography ml={1} color="text.secondary">
          Crypto currency
        </Typography>
      </Box>
      <MultiselectAssetsWithValidation
        name="convertedCurrencies"
        variant="outlined"
        currencies={currencies.items}
        isLoading={currencies.isLoading}
        form={form}
        data-testid="invoice-create-crypto-currency-select"
      />
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          my: 2,
          color: 'text.tertiary',
          borderColor: 'tertiary.light',
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: 1,
          '&:before': {
            display: 'none',
          },
        }}
        data-testid="invoice-create-options-accordion"
      >
        <AccordionSummary expandIcon={<Icon name="chevron-down" />}>
          Options
        </AccordionSummary>
        <AccordionDetails>
          <Box my={1}>
            <FormLabel htmlFor="description">
              Invoice description for customers
            </FormLabel>
            <TextFieldWithValidation
              id="description"
              fullWidth
              form={form}
              placeholder="Description"
              name="description"
              multiline
              data-testid="invoice-create-description-input"
              onChange={(e) => e.target.value}
            />
          </Box>
          <DatePickerWithValidation
            label="Due Date"
            name="dueDate"
            form={form}
            textFieldProps={{
              margin: 'normal',
            }}
            data-testid="invoice-create-due-date-picker"
          />
        </AccordionDetails>
      </Accordion>
      <FormControlLabel
        sx={{
          color: 'text.secondary',
        }}
        control={
          <VCheckbox color="tertiary" name="overrideShortcut" form={form} />
        }
        label="Apply these coins to future invoices"
      />
      <Button
        type="submit"
        disabled={
          invoiceCreate.isPending ||
          !form.isInitiated ||
          Boolean(form.primaryError)
        }
        fullWidth
        size="large"
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        data-testid="invoice-create-submit-button"
      >
        Create Invoice
      </Button>
    </Box>
  );
};

export default CreateInvoiceForm;
