import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import dayjs from 'dayjs';
import { isRequired } from 'dex-helpers';
import { useGlobalModalContext } from 'dex-ui';
import { InfoIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';

import {
  DatePickerWithValidation,
  SelectCurrencyWithValidation,
  TextFieldWithValidation,
} from './fields';
import { ROUTE_MERCHANT } from '../../../constants/pages';
import { useMutation } from '../../../hooks/use-query';
import { useUser } from '../../../hooks/use-user';
import { Invoice } from '../../../services';
import DatePickerComponent from '../../ui/DatePicker';
import SelectCoinAmount from '../../ui/SelectCoinAmount';

interface InvoiceData {
  coinAmount: {
    amount: number | null;
    currency: string;
  } | null;
  mainCurrency: string;
  convertedCurrencies: string;
  description: string;
  dueDate: dayjs.Dayjs | null;
}

const CreateInvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    coinAmount: null,
    mainCurrency: '', // Initialize with an empty string
    convertedCurrencies: '',
    description: '',
    dueDate: null,
  });
  const { showModal } = useGlobalModalContext();
  const [, navigate] = useLocation();
  const { user } = useUser();

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
    invoiceCreate.mutate([{ projectId: user.project.id }, { ...invoiceData }]);
  };
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <SelectCoinAmount
        value={invoiceData.coinAmount}
        name="coinAmount"
        validators={[isRequired]}
        onChange={(v) => handleInputChange('coinAmount', v)}
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
      <TextFieldWithValidation
        margin="normal"
        fullWidth
        form={formRef}
        label="Description (Optional)"
        name="description"
        multiline
        value={invoiceData.description}
        onChange={handleInputChange}
      />

      <DatePickerWithValidation
        value={invoiceData.dueDate}
        label="Due Date (Optional)"
        form={formRef}
        onChange={handleInputChange}
        textFieldProps={{
          margin: 'normal',
        }}
      />

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
