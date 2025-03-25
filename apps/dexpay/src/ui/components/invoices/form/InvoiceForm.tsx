import {
  Box,
  Typography,
  FormLabel,
  AccordionDetails,
  AccordionSummary,
  Accordion,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  AssetItem,
  CircleNumber,
  Icon,
  useForm,
  Button,
  useGlobalModalContext,
  useLoader,
} from 'dex-ui';
import { map } from 'lodash';
import { Info } from 'lucide-react';
import { useHashLocation } from 'wouter/use-hash-location';

import { ROUTE_INVOICE_DETAIL, ROUTE_MERCHANT } from '../../../constants/pages';
import { useAuth } from '../../../hooks/use-auth';
import { useCurrencies } from '../../../hooks/use-currencies';
import { useMutation, useQuery } from '../../../hooks/use-query';
import { Currency, Invoice, Preferences } from '../../../services';
import { CurrencyModel, ICurrency } from '../../../types';
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
    coin: ICurrency | null;
  };
  convertedCurrencies: CurrencyModel[];
  description: string;
  dueDate: dayjs.Dayjs | null;
}

const ShortCutProposal = ({
  createInvoiceCallback,
  values,
}: {
  createInvoiceCallback: () => Promise<void>;
  values: InvoiceData;
}) => {
  const loader = useLoader();
  const { hideModal } = useGlobalModalContext();
  const {
    user: { project },
  } = useAuth();
  const form = useForm({
    values,
    method: async (data) => {
      if (!project?.id) {
        return;
      }
      await Preferences.save(
        { projectId: project.id },
        {
          converted_coin_id: data.primaryCoin.coin.id,
          currencies: data.convertedCurrencies.map((asset) => ({
            currency_id: asset.currency.id,
          })),
        },
      );
      await createInvoiceCallback();
    },
  });

  const hide = () => {
    hideModal();
    loader.runLoader(createInvoiceCallback());
  };
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <Info size={60} />
      </Box>

      <Typography variant="h6" fontWeight="bold">
        Want quick creating? Create a shortcut with these coin parameters!
      </Typography>

      <Typography mt={2}>
        Primary coin - {values.primaryCoin.coin.iso}
      </Typography>
      <Typography mt={1} mb={1}>
        Supported currencies
      </Typography>
      {values.convertedCurrencies.map((i) => (
        <Chip
          key={i.iso}
          sx={{ m: 0.5, height: 45 }}
          label={<AssetItem asset={i} />}
        />
      ))}
      <Box display="flex" mt={3} justifyContent="space-between">
        <Button onClick={hide}>Cancel and continue</Button>
        <Button gradient onClick={form.submit}>
          Create shortcut
        </Button>
      </Box>
    </Box>
  );
};

const CreateInvoiceForm = () => {
  const { showModal } = useGlobalModalContext();
  const [, navigate] = useHashLocation();
  const { user, invoicePreferences } = useAuth();

  const currencies = useCurrencies();

  const invoiceCreate = useMutation(Invoice.create, {
    onSuccess: (data) => {
      navigate(
        `${ROUTE_INVOICE_DETAIL.replace(':id', `${data.public_id}:${data.id}`)}`,
      );
    },
  });

  const form = useForm<InvoiceData>({
    values: {
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
      const primaryCoin = values.primaryCoin.coin;
      const body = {
        description: values.description || undefined,
        due_to: dueToEndOfDay,
        converted_amount_requested: values.primaryCoin?.amount,
        converted_coin_id: primaryCoin.id,
        amount_requested: undefined,
        currency_id: undefined,
        coin_id: undefined,
        ...(values.convertedCurrencies.length
          ? {
              supported_currencies: map(
                values.convertedCurrencies,
                'currency.id',
              ),
            }
          : {}),
      };
      const create = () =>
        invoiceCreate.mutateAsync([{ projectId: user.project.id }, body]);
      const isShortcutCreated = Boolean(invoicePreferences);
      if (isShortcutCreated) {
        await create();
      } else {
        showModal({
          component: () => (
            <ShortCutProposal createInvoiceCallback={create} values={values} />
          ),
        });
      }
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
        Create Invoice
      </Button>
    </Box>
  );
};

export default CreateInvoiceForm;
