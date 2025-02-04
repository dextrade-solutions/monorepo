import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormLabel,
  AccordionDetails,
  AccordionSummary,
  Accordion,
} from '@mui/material';
import dayjs from 'dayjs';
import { isRequired } from 'dex-helpers';
import {
  CircleNumber,
  Icon,
  MultiselectAssets,
  useGlobalModalContext,
} from 'dex-ui';
import _ from 'lodash';
import { InfoIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';

import {
  DatePickerWithValidation,
  MultiselectAssetsWithValidation,
  SelectCurrencyWithValidation,
  TextFieldWithValidation,
} from './fields';
import { ROUTE_MERCHANT } from '../../../constants/pages';
import { useCurrencies } from '../../../hooks/use-currencies';
import { useMutation, useQuery } from '../../../hooks/use-query';
import { useUser } from '../../../hooks/use-user';
import { Currency, Invoice } from '../../../services';
import DatePickerComponent from '../../ui/DatePicker';
import SelectCoinAmount from '../../ui/SelectCoinAmount';

interface InvoiceData {
  primaryCoin: {
    amount: number | null;
    coin: string;
  } | null;
  mainCurrency: string;
  convertedCurrencies: string[];
  description: string;
  dueDate: dayjs.Dayjs | null;
}

const CreateInvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    primaryCoin: {
      amount: null,
      coin: 'USDT',
    },
    mainCurrency: '', // Initialize with an empty string
    convertedCurrencies: [],
    description: '',
    dueDate: null,
  });
  const { showModal } = useGlobalModalContext();
  const [, navigate] = useLocation();
  const { user } = useUser();

  const currencies = useCurrencies();

  const invoiceCreate = useMutation(Invoice.create, {
    onError: (e) => {
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: e.message,
      });
    },
    onSuccess: () => {
      navigate(ROUTE_MERCHANT);
    },
  });
  const coins = useQuery(Currency.coins);

  const allCoins = (coins.data?.list.currentPageResult || []).reduce(
    (acc, coin) => ({ ...acc, [coin.iso]: coin }),
    {},
  );

  const formRef = useRef<{ [k: string]: string[] }>({});
  const formError = Object.values(formRef.current).find((v) => v[0]);
  const isFormInitialized = Object.values(formRef.current).length > 0;

  const handleInputChange = (field: string, value: string) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      throw new Error('no user exists');
    }
    const values = invoiceData;
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
            supported_currencies: _.map(
              values.convertedCurrencies,
              'extra.currency.id',
            ),
          }
        : {}),
    };
    invoiceCreate.mutate([{ projectId: user.project.id }, body]);
  };
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Box my={1} display="flex" alignItems="center">
        <CircleNumber color="secondary.light" number={1} />
        <Typography ml={1}>Primary coin</Typography>
      </Box>
      <SelectCoinAmount
        value={invoiceData.primaryCoin}
        form={formRef}
        coins={allCoins}
        isLoading={coins.isLoading}
        name="primaryCoin"
        validators={[isRequired]}
        onChange={handleInputChange}
      />
      <Box mt={3} display="flex" alignItems="center">
        <CircleNumber color="secondary.light" number={2} />
        <Typography ml={1}>Crypto currency</Typography>
      </Box>
      <MultiselectAssetsWithValidation
        value={invoiceData.convertedCurrencies}
        name="convertedCurrencies"
        currencies={currencies.items}
        isLoading={currencies.isLoading}
        form={formRef}
        onChange={handleInputChange}
      />

      {/* <FormControl fullWidth margin="normal" required>
        <InputLabel id="main-currency-label">Main Currency</InputLabel>
        <Select
          labelId="main-currency-label"
          name="mainCurrency"
          value={invoiceData.mainCurrency}
          label="Main Currency" // Add label prop
        >
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="EUR">EUR</MenuItem>
        </Select>
      </FormControl> */}

      {/* <TextField
        margin="normal"
        fullWidth
        label="Converted Currencies (Optional)"
        name="convertedCurrencies"
        value={invoiceData.convertedCurrencies}
        onChange={handleInputChange}
      /> */}

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
              form={formRef}
              placeholder="Description"
              name="description"
              multiline
              value={invoiceData.description}
              onChange={(v) => handleInputChange(v)}
            />
          </Box>
          <DatePickerWithValidation
            value={invoiceData.dueDate}
            label="Due Date"
            form={formRef}
            onChange={handleInputChange}
            textFieldProps={{
              margin: 'normal',
            }}
          />
        </AccordionDetails>
      </Accordion>

      <Button
        type="submit"
        disabled={
          invoiceCreate.isPending || !isFormInitialized || Boolean(formError)
        }
        fullWidth
        size="large"
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        {formError || 'Create Invoice'}
      </Button>
    </Box>
  );
};

export default CreateInvoiceForm;
