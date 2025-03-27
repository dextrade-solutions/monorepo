import { alpha, Box, Button, Grid, Grow, Typography } from '@mui/material';
import currencies from 'currency-formatter/currencies';
import { useForm } from 'dex-ui';
import { LogOut } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import InputPayment from '../components/terminal/InputPayment';
import PaymentProcessing from '../components/terminal/PaymentProcessing';
import PickCoin from '../components/ui/PickCoin';
import { useAuth } from '../hooks/use-auth';
import { useMutation, useQuery } from '../hooks/use-query';
import { Currency, Invoice } from '../services';
import { IInvoice } from '../types';

const MOCK = {
  supported_currencies: null,
  converted_amount_requested: '400',
  converted_coin_id: 97,
  currency_id: 87,
  project_id: 1863,
  id: 2288,
  amount_requested: '11.68',
  amount_received_total: '0',
  status: 1,
  coin_id: null,
  description: null,
  due_to: null,
  public_id:
    'a6821694-9614-4077-acb4-301d962d1f23-bc30afb4f64bfff5ab3b7454650383f3',
  address_to: '0xbE31F1ac38f75401Ba3cA6a56b5419132146D1bf',
  status_label: 'Waiting for payment',
  payment_page_url:
    'https://ecom.dextrade.com/a6821694-9614-4077-acb4-301d962d1f23-bc30afb4f64bfff5ab3b7454650383f3',
};

const Paper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      width="100%"
      sx={{
        boxShadow: '0px 0px 20px 0px #0000001A',
        borderRadius: 1,
        bgcolor: 'background.default',
        p: 2,
        display: 'flex', // Add this
        justifyContent: 'center', // And this
        alignItems: 'center', // And this
      }}
    >
      {children}
    </Box>
  );
};

export default function Terminal() {
  const { user, setPrimaryCurrency, logout } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedAsset, setAsset] = useState();
  const [invoice, setInvoice] = useState<IInvoice>();
  const coinsQuery = useQuery(Currency.coins);

  const createInvoice = useMutation(Invoice.create, {
    onSuccess: (v) => {
      setInvoice(v);
    },
  });

  const primaryCurrency = user?.primaryCurrency;

  let currency = currencies.find((c) => c.code === primaryCurrency);
  if (!currency) {
    currency = {
      symbol: primaryCurrency,
      symbolOnLeft: false,
    };
  }

  const createInvoiceForm = useForm({
    method: () => {
      const primaryCoin = (coinsQuery.data?.list.currentPageResult || []).find(
        (c) => c.iso === primaryCurrency,
      );

      if (!primaryCoin) {
        throw new Error('createInvoiceForm - Primary currency id not found');
      }
      return createInvoice.mutateAsync([
        { projectId: user?.project.id },
        {
          converted_amount_requested: amount,
          converted_coin_id: primaryCoin.id,
          currency_id: selectedAsset.currency.id,
        },
      ]);
    },
  });

  const content = useMemo(() => {
    if (!primaryCurrency) {
      return (
        <>
          <Typography
            mb={4}
            color="tertiary.contrastText"
            variant="h6"
            fontWeight="bold"
            textAlign="center"
          >
            Please, set primary currency
          </Typography>
          <Paper>
            <PickCoin value={primaryCurrency} onChange={setPrimaryCurrency} />
          </Paper>
        </>
      );
    } else if (invoice && selectedAsset) {
      return (
        <Box>
          <Paper>
            <PaymentProcessing
              invoiceId={invoice.public_id}
              asset={selectedAsset}
            />
          </Paper>
          <Button
            fullWidth
            sx={{ mt: 3 }}
            variant="contained"
            color="tertiary"
            size="large"
            onClick={() => {
              setInvoice(undefined);
              setAmount('');
              setAsset(undefined);
            }}
          >
            New invoice
          </Button>
        </Box>
      );
    }
    return (
      <InputPayment
        amount={amount}
        currency={currency}
        selectedAsset={selectedAsset}
        setAsset={setAsset}
        setPrimaryCurrency={setPrimaryCurrency}
        setAmount={setAmount}
        isLoading={createInvoice.isPending}
        onConfirm={createInvoiceForm.submit}
      />
    );
  }, [
    createInvoice.isPending,
    createInvoiceForm,
    primaryCurrency,
    invoice,
    selectedAsset,
    amount,
    currency,
    setPrimaryCurrency,
    setAsset,
    setAmount,
  ]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        // height: '90vh', // Make container take up full viewport height
        justifyContent: 'center', // Vertically center content
        alignItems: 'center', // Horizontally center content
      }}
    >
      <Box my={4} display="flex" sx={{ top: 40 }}>
        <Typography mb={3} color="tertiary.contrastText">
          Dex<strong>Pay Terminal</strong>
        </Typography>
        <Typography ml={1} sx={{ opacity: 0.5 }} color="tertiary.contrastText">
          <LogOut onClick={() => logout()} />
        </Typography>
      </Box>
      {content}
    </Box>
  );
}
