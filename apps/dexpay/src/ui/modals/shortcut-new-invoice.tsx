import { Box, Chip, Typography, Skeleton } from '@mui/material';
import { currencies } from 'currency-formatter';
import { getCoinIconByUid } from 'dex-helpers';
import { Button, ModalProps, NumericTextField, UrlIcon, useForm } from 'dex-ui';
import { map } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import {
  CURRENCIES_ISO_BY_GROUP_TYPE,
  CurrencyGroupType,
} from '../constants/coins';
import { ROUTE_INVOICE_DETAIL } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useCurrencies } from '../hooks/use-currencies';
import { useMutation, useQuery } from '../hooks/use-query';
import { Currency, Invoice } from '../services';

interface ShortcutNewInvoiceProps {
  isOpenInvoice: boolean;
  currencyGroupType: CurrencyGroupType;
  onChange: (v: string) => void;
}

const ShortcutNewInvoice: React.FC<ShortcutNewInvoiceProps & ModalProps> = ({
  isOpenInvoice,
  currencyGroupType,
  hideModal,
}) => {
  const [, navigate] = useHashLocation();
  const { user, invoicePreferences } = useAuth();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const assets = useCurrencies();
  const coins = useQuery(Currency.coins, [{ type: 'fiat' }]);

  let primaryCoin = (coins.data?.list.currentPageResult || []).find(
    ({ id }) => id === invoicePreferences?.converted_coin_id,
  );
  let renderListCurrencies;
  if (currencyGroupType === CurrencyGroupType.my && invoicePreferences) {
    renderListCurrencies = assets.items.filter(({ currency }) =>
      invoicePreferences.currencies.find(({ name }) => name === currency.name),
    );
  } else {
    renderListCurrencies = assets.items.filter(({ currency }) =>
      CURRENCIES_ISO_BY_GROUP_TYPE[currencyGroupType].includes(currency.name),
    );
  }

  if (!primaryCoin) {
    primaryCoin = {
      iso: 'USD',
      id: 101,
    };
  }

  const isLoading = assets.isLoading || coins.isLoading;

  const currency = currencies.find((c) => c.code === primaryCoin?.iso);

  const inputRef = useRef<HTMLInputElement>(null);

  const invoiceCreate = useMutation(Invoice.create, {
    onSuccess: (invoice) => {
      navigate(
        `${ROUTE_INVOICE_DETAIL.replace(':id', `${invoice.public_id}:${invoice.id}`)}`,
      );
      hideModal();
    },
  });

  useEffect(() => {
    if (!isOpenInvoice && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpenInvoice]);

  const form = useForm({
    method: async () => {
      const body = {
        converted_amount_requested: amount,
        converted_coin_id: primaryCoin?.id,
        supported_currencies: map(renderListCurrencies, 'currency.id'),
      };
      await invoiceCreate.mutateAsync([{ projectId: user!.project!.id }, body]);
    },
  });
  return (
    <Box padding={3}>
      <Typography variant="h5" mb={3}>
        {isOpenInvoice ? 'New open invoice' : 'New invoice'}
      </Typography>
      {!isOpenInvoice && (
        <Box my={2}>
          {isLoading ? (
            <Skeleton width="100%" height={60} />
          ) : (
            <NumericTextField
              value={amount}
              onChange={setAmount}
              allowNegative={false}
              placeholder="0"
              textFieldProps={{
                inputRef,
                variant: 'standard',
                fullWidth: true,
              }}
              InputProps={{
                sx: {
                  fontSize: 25,
                },
                disableUnderline: true,
                startAdornment: (
                  <Typography mr={1} fontSize={25}>
                    {currency?.symbol}
                  </Typography>
                ),
              }}
            />
          )}
        </Box>
      )}

      <Typography color="text.secondary" mt={4} ml={1} mb={2}>
        Clients can pay with:{' '}
      </Typography>
      <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} width={100} height={40} />
            ))}
          </>
        ) : (
          renderListCurrencies.map((asset) => (
            <Chip
              margin="normal"
              key={asset.iso}
              label={
                <Box display="flex">
                  <Typography>{asset.symbol}</Typography>
                  {asset.standard && (
                    <Typography ml={1} color="text.secondary">
                      {asset.standard.toLowerCase()}
                    </Typography>
                  )}
                </Box>
              }
              variant="outlined"
              icon={<UrlIcon url={getCoinIconByUid(asset.uid)} />}
            />
          ))
        )}
      </Box>
      <Box mt={4} display="flex" justifyContent="space-between" gap={2}>
        <Button onClick={hideModal}>Cancel</Button>
        <Button
          sx={{ px: 8 }}
          gradient
          variant="contained"
          onClick={form.submit}
          disabled={isLoading}
        >
          Create
        </Button>
      </Box>
    </Box>
  );
};

export default ShortcutNewInvoice;
