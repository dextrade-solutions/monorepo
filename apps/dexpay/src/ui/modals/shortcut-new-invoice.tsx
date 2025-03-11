import { Box, Typography } from '@mui/material';
import { Button, ModalProps } from 'dex-ui';
import React from 'react';

import {
  CURRENCIES_ISO_BY_GROUP_TYPE,
  CurrencyGroupType,
} from '../constants/coins';
import { useCurrencies } from '../hooks/use-currencies';

interface ShortcutNewInvoiceProps {
  isOpenInvoice: boolean;
  currencyGroupType: CurrencyGroupType;
  onChange: (v: string) => void;
}

const ShortcutNewInvoice: React.FC<ShortcutNewInvoiceProps & ModalProps> = ({
  isOpenInvoice,
  currencyGroupType,
  hideModal,
  onChange,
}) => {
  const currencies = useCurrencies();
  const renderListCurrencies = currencies.items.filter(({ currency }) =>
    CURRENCIES_ISO_BY_GROUP_TYPE[currencyGroupType].includes(currency.iso),
  );
  const primaryCurrency = 'USD';
  const handleCreate = () => {
    hideModal();
  };
  return (
    <Box padding={3}>
      <Typography>{isOpenInvoice ? 'Open invoice' : 'Invoice'}</Typography>
      <Box>
        <Button>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </Box>
    </Box>
  );
};

export default ShortcutNewInvoice;
