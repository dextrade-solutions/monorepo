import {
  Box,
  Button,
  Typography,
  FormLabel,
  AccordionDetails,
  AccordionSummary,
  Accordion,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  CircleNumber,
  Icon,
  useForm,
  useGlobalModalContext,
  useLoader,
} from 'dex-ui';
import { map } from 'lodash';
import React, { useState } from 'react';
import { useLocation } from 'wouter';

import { ROUTE_MERCHANT } from '../../../constants/pages';
import { useAuth } from '../../../hooks/use-auth';
import { useCurrencies } from '../../../hooks/use-currencies';
import { useMutation, useQuery } from '../../../hooks/use-query';
import { Currency, Invoice } from '../../../services';
import { Validation } from '../../../validation';
import {
  DatePickerWithValidation,
  MultiselectAssetsWithValidation,
  TextFieldWithValidation,
} from '../../fields';
import SelectCoinAmount from '../../ui/SelectCoinAmount';

interface InvoiceData {
  primaryCoin: {
    amount: number | null;
    coin: string;
  } | null;
  convertedCurrencies: string[];
  description: string;
  dueDate: dayjs.Dayjs | null;
}

const CreateInvoiceForm = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const currencies = useCurrencies();

  const invoiceCreate = useMutation(Invoice.create, {
    onSuccess: () => {
      navigate(ROUTE_MERCHANT);
    },
  });
  const coins = useQuery(Currency.coins, [{ type: 'fiat' }]);

  const allCoins = (coins.data?.list.currentPageResult || []).reduce(
    (acc, coin) => ({ ...acc, [coin.iso]: coin }),
    {},
  );

  const form = useForm<InvoiceData>({
    values: {
      primaryCoin: {
        amount: null,
        coin: 'THB',
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

      const body = {
        description: values.description || undefined,
        due_to: dueToEndOfDay,
        converted_amount_requested: values.primaryCoin?.amount,
        converted_coin_id: allCoins[values.primaryCoin?.coin].id,
        amount_requested: undefined,
        currency_id: undefined,
        coin_id: undefined,
        ...(values.convertedCurrencies.length
          ? {
              supported_currencies: map(
                values.convertedCurrencies,
                'extra.currency.id',
              ),
            }
          : {}),
      };
      await invoiceCreate.mutateAsync([{ projectId: user.project.id }, body]);
    },
  });

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
        coins={allCoins}
        isLoading={coins.isLoading}
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
        {form.primaryError || 'Create Invoice'}
      </Button>
    </Box>
  );
};

export default CreateInvoiceForm;
