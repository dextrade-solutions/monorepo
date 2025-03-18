import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  InputAdornment,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { AssetModel } from 'dex-helpers/types';
import {
  CircleNumber,
  Button,
  Icon,
  SelectCoinsSwap,
  useForm,
  AssetPriceOutput,
} from 'dex-ui';
import { orderBy } from 'lodash';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation, useQuery } from '../../hooks/use-query';
import { Pairs, DexTrade, Address, Invoice, Rates } from '../../services'; // Adjust path as needed
import { Validation } from '../../validation';
import {
  SelectCurrencyWithValidation,
  TextFieldWithValidation,
  VNumericTextField,
} from '../fields';

// Define the shape of the price source provider
interface PriceSourceProvider {
  label: string;
  key: string;
  query: string;
}

// Define the form values type
export interface CreateAdvertFormValues {
  pairId: number;
  coin1: AssetModel | null; // Use ICurrency from your types
  coin2: AssetModel | null;
  priceSourceProvider: PriceSourceProvider;
  exchangersPolicy: string;
  minimumExchangeAmountCoin1: number | null;
  maximumExchangeAmountCoin1: string;
  priceAdjustment: string;
  transactionFee: string;
}

/**
 * List price source providers
 */
const priceSourceProviders = [
  {
    label: 'CoinMarketCap',
    key: 'coin-market-cap',
    query: 'rateSourceCoinMarketCap',
  },
  {
    label: 'CoinGecko',
    key: 'coin-gecko',
    query: 'rateSourceCoinGecko',
  },
];

const CreateAdvertForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const projectId = user?.project?.id!;
  const queryClient = useQueryClient();
  // const [rate, setRate] = useState<number>();
  const advCreate = useMutation(DexTrade.advertCreateFromPair, {
    onSuccess,
    onMutate: () => {
      return queryClient.removeQueries({ queryKey: ['ads-list'] });
    },
    onError: (_err, _newTodo, context: any) => {
      queryClient.setQueryData(['ads-list'], context.previousAds);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-list'] });
    },
  });
  const pairsCreate = useMutation(Pairs.create);

  const form = useForm<CreateAdvertFormValues>({
    values: {
      pairId: 0,
      coin1: null,
      coin2: null,
      priceSourceProvider: priceSourceProviders[0],
      exchangersPolicy: '',
      minimumExchangeAmountCoin1: null,
      maximumExchangeAmountCoin1: '',
      priceAdjustment: '',
      transactionFee: '',
    },
    validationSchema: Validation.DexTrade.Advert.create,
    method: saveAd,
  });
  const isBothCoinsSelected = Boolean(form.values.coin1 && form.values.coin2);
  const pairIso = `${form.values.coin1?.currency.iso}:${form.values.coin2?.currency.iso}`;

  const rateQuery = useQuery(
    Rates.getRate,
    [
      {
        pair: pairIso,
      },
    ],
    {
      enabled: isBothCoinsSelected,
    },
  );

  const priceSourcesCoin1 = useQuery(
    Pairs.priceSources,
    [
      {
        currency_id: form.values.coin1?.currency.id,
      },
    ],
    {
      enabled: Boolean(form.values.coin1),
    },
  );

  const priceSourcesCoin2 = useQuery(
    Pairs.priceSources,
    [
      {
        currency_id: form.values.coin2?.currency.id,
      },
    ],
    {
      enabled: Boolean(form.values.coin2),
    },
  );

  const handleSwap = () => {
    form.setValue('coin1', form.values.coin2);
    form.setValue('coin2', form.values.coin1);
  };

  function getIsoPriceSourceCoin({
    reversed,
    raiseError,
  }: { reversed?: boolean; raiseError?: boolean } = {}) {
    const resp = reversed ? priceSourcesCoin2 : priceSourcesCoin1;
    const result = (resp.data?.currentPageResult || []).find(
      (i) => i.service_type === form.values.priceSourceProvider.key,
    );
    if (!result && raiseError) {
      throw new Error(
        `Cannot get price source for ${reversed ? 'coin2' : 'coin1'}`,
      );
    }
    return result;
  }

  async function saveAd(values: CreateAdvertFormValues) {
    const addressesResp = await Address.listByCurrency(
      {
        projectId: user.project!.id,
      },
      {
        page: 0,
        'currency_id[0]': values.coin1.currency.id,
        'currency_id[1]': values.coin2.currency.id,
      },
    );
    const currency1Id = values.coin1.currency.id;
    const currency2Id = values.coin2.currency.id;

    const addresses = addressesResp.currentPageResult || [];
    const [address1] = orderBy(
      addresses.filter((i) => i.currency_id === currency1Id),
      'balance',
      'desc',
    );
    const [address2] = orderBy(
      addresses.filter((i) => i.currency_id === currency2Id),
      'balance',
      'desc',
    );

    if (!address1) {
      throw new Error('Address for coin from not found');
    }
    if (!address2) {
      throw new Error('Address for coin to not found');
    }
    const result = await pairsCreate.mutateAsync([
      { projectId },
      {
        currency_main_id: values.coin1.currency.id,
        currency_second_id: values.coin2.currency.id,
        liquidity_address_main_id: address1.id,
        liquidity_address_second_id: address2.id,
        [values.priceSourceProvider.query]: {
          main_iso: getIsoPriceSourceCoin({ raiseError: true })
            .service_currency_iso,
          second_iso: getIsoPriceSourceCoin({
            raiseError: true,
            reversed: true,
          }).service_currency_iso,
        },
      },
    ]);
    await advCreate.mutateAsync([
      { projectId },
      {
        pair_id: result.id,
        exchangersPolicy: values.exchangersPolicy,
        priceAdjustment: values.priceAdjustment || '0',
        minimumExchangeAmountCoin1: values.minimumExchangeAmountCoin1,
        maximumExchangeAmountCoin1: values.maximumExchangeAmountCoin1,
        transactionFee: values.transactionFee || undefined,
      },
    ]);
  }

  const rate = rateQuery.data && rateQuery.data[pairIso]?.rateFloat;

  return (
    <Box component="form" onSubmit={form.submit} noValidate sx={{ mt: 1 }}>
      <Box display="flex" my={1} alignItems="center">
        <CircleNumber number={1} color="tertiary.main" />
        <Typography ml={2} fontWeight="bold" color="text.tertiary">
          Pair
        </Typography>
      </Box>
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'secondary.dark',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box zIndex={1}>
          <Typography fontWeight="bold">
            <SelectCurrencyWithValidation
              placeholder="I send"
              title="I send"
              name="coin1"
              noZeroBalances
              form={form}
            />
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            width: '100%',
          }}
        >
          <SelectCoinsSwap onClick={handleSwap} />
        </Box>
        <Box ml={1}>
          <Typography fontWeight="bold">
            <SelectCurrencyWithValidation
              placeholder="I get"
              title="I get"
              name="coin2"
              reversed
              form={form}
            />
          </Typography>
        </Box>
      </Paper>
      {form.values.coin1 && form.values.coin2 && (
        <>
          <Box
            display="flex"
            mt={4}
            mb={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <CircleNumber number={2} color="tertiary.main" />
              <Typography ml={2} fontWeight="bold" color="text.tertiary">
                Rate
              </Typography>
            </Box>
            {rate && !rateQuery.isLoading ? (
              <Typography mr={2}>
                <AssetPriceOutput
                  price={
                    rate + Number(rate * form.values.priceAdjustment) / 100
                  }
                  tickerFrom={form.values.coin1.symbol}
                  tickerTo={form.values.coin2.symbol}
                />
              </Typography>
            ) : (
              <Skeleton width={180} height={40} />
            )}
          </Box>

          <VNumericTextField
            margin="normal"
            fullWidth
            form={form}
            label="Price adjustment"
            name="priceAdjustment"
            InputProps={{
              // Add InputProps for the adornment
              startAdornment: (
                <InputAdornment position="start">%</InputAdornment>
              ),
            }}
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
            <AccordionSummary
              expandIcon={<Icon size="sm" name="chevron-down" />}
            >
              <Typography mr={1}>
                {form.values.priceSourceProvider.label}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {form.values.coin1?.symbol} ID:{' '}
                {priceSourcesCoin1.isLoading
                  ? 'Loading...'
                  : getIsoPriceSourceCoin()?.service_currency_iso ||
                    'Not found'}
              </Typography>
              <Typography>
                {form.values.coin2?.symbol} ID:{' '}
                {priceSourcesCoin2.isLoading
                  ? 'Loading...'
                  : getIsoPriceSourceCoin({ reversed: true })
                      ?.service_currency_iso || 'Not found'}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </>
      )}
      {form.values.coin1 && form.values.coin2 && (
        <>
          <Box display="flex" mt={4} alignItems="center">
            <CircleNumber number={3} color="tertiary.main" />
            <Typography ml={2} fontWeight="bold" color="text.tertiary">
              Trade configuration
            </Typography>
          </Box>
          <VNumericTextField
            margin="normal"
            fullWidth
            label={`Minimum Trade Amount ${form.values.coin1?.symbol}`}
            name="minimumExchangeAmountCoin1"
            form={form}
          />
          <VNumericTextField
            margin="normal"
            fullWidth
            label={`Maximum Trade Amount ${form.values.coin1?.symbol}`}
            form={form}
            name="maximumExchangeAmountCoin1"
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
            <AccordionSummary
              expandIcon={<Icon size="sm" name="chevron-down" />}
            >
              <Typography mr={1}>Options</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextFieldWithValidation
                margin="normal"
                fullWidth
                multiline
                rows={4}
                label="Exchangers Policy"
                name="exchangersPolicy"
                form={form}
                onChange={(e) => e.target.value}
              />
              <TextFieldWithValidation
                margin="normal"
                fullWidth
                label="Transaction Fee"
                type="number"
                form={form}
                name="transactionFee"
                onChange={(e) => e.target.value}
              />
            </AccordionDetails>
          </Accordion>

          <Button
            type="submit"
            fullWidth
            gradient
            color="primary"
            disabled={Boolean(form.primaryError)}
            sx={{ mt: 3, mb: 2 }}
          >
            {form.primaryError || 'Create Advert'}
          </Button>
        </>
      )}
    </Box>
  );
};

export default CreateAdvertForm;
