import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  InputAdornment,
  Paper,
  Skeleton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
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
import React from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation, useQuery } from '../../hooks/use-query';
import { Pairs, DexTrade, Address, Rates } from '../../services'; // Adjust path as needed
import { Validation } from '../../validation';
import {
  SelectCurrencyWithValidation,
  TextFieldWithValidation,
  VNumericTextField,
} from '../fields';
import AdItem from './AdItem';
import { useAdvertActions } from './useAdvertActions';

// Define the shape of the price source provider
interface PriceSourceProvider {
  label: string;
  key: string;
  query?: string; // Make query optional since fixed price won't need it
}

// Define the form values type
export interface CreateAdvertFormValues {
  pairId: number;
  coin1: AssetModel | null; // Use ICurrency from your types
  coin2: AssetModel | null;
  priceSourceProvider: PriceSourceProvider;
  exchangersPolicy: string;
  minimumExchangeAmountCoin1: number | null;
  maximumExchangeAmountCoin1: string | null;
  priceAdjustment: string;
  transactionFeeType: 'auto' | 'youPay' | 'fixed';
  transactionFee: string;
  fixedPrice: string;
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
  // {
  //   label: 'CoinGecko',
  //   key: 'coin-gecko',
  //   query: 'rateSourceCoinGecko',
  // },
  {
    label: 'Fixed Price',
    key: 'FIXED_RATE',
  },
];

const CreateAdvertForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const projectId = user?.project?.id!;
  const queryClient = useQueryClient();
  const { handleDelete, toggleActive } = useAdvertActions();
  // const [rate, setRate] = useState<number>();
  const { data: existingAds, refetch } = useQuery(() =>
    DexTrade.advertsList({ projectId }, { no_pagination: 1 }),
  );

  const advCreate = useMutation(DexTrade.advertCreateFromPair, {
    onSuccess,
    onMutate: () => {
      return queryClient.removeQueries({ queryKey: ['ads-list'] });
    },
    onError: (_err, _newTodo, context: any) => {
      if (
        _err?.message?.includes(
          'Exchanger setting and reversed exchanger setting already exist for this user.',
        )
      ) {
        _err.message = 'The ad with this pair already exists';
      }
      queryClient.setQueryData(['ads-list'], context);
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
      maximumExchangeAmountCoin1: null,
      priceAdjustment: '',
      transactionFeeType: 'auto',
      transactionFee: '',
      fixedPrice: '',
    },
    validationSchema: Validation.DexTrade.Advert.create,
    method: saveAd,
  });
  const isBothCoinsSelected = Boolean(form.values.coin1 && form.values.coin2);
  const pairIso = `${form.values.coin1?.currency.iso}:${form.values.coin2?.currency.iso}`;

  // Check if pair already exists
  const existingPair = existingAds?.find((ad) => {
    const adPairIso = `${ad.details.from.ticker}:${ad.details.to.ticker}`;
    return adPairIso === pairIso;
  });

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
    const pairConfig =
      values.priceSourceProvider.key === 'FIXED_RATE'
        ? {
            fixedRate: {
              rate: values.fixedPrice,
            },
          }
        : {
            [values.priceSourceProvider.query]: {
              main_iso: getIsoPriceSourceCoin({ raiseError: true })
                .service_currency_iso,
              second_iso: getIsoPriceSourceCoin({
                raiseError: true,
                reversed: true,
              }).service_currency_iso,
            },
          };

    const result = await pairsCreate.mutateAsync([
      { projectId },
      {
        currency_main_id: values.coin1.currency.id,
        currency_second_id: values.coin2.currency.id,
        liquidity_address_main_id: address1.id,
        liquidity_address_second_id: address2.id,
        ...pairConfig,
      },
    ]);

    await advCreate.mutateAsync([
      { projectId },
      {
        pair_id: result.id,
        exchangersPolicy: values.exchangersPolicy,
        priceAdjustment: values.priceAdjustment || '0',
        minimumExchangeAmountCoin1: values.minimumExchangeAmountCoin1
          ? String(values.minimumExchangeAmountCoin1)
          : '0',
        maximumExchangeAmountCoin1: values.maximumExchangeAmountCoin1
          ? String(values.maximumExchangeAmountCoin1)
          : undefined,
        transactionFee: values.transactionFee || null,
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
      {isBothCoinsSelected && existingPair && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning" sx={{ my: 2 }}>
            A pair with these coins already exists:
          </Alert>
          <AdItem
            advert={existingPair}
            fromCoin={existingPair.details.from}
            toCoin={existingPair.details.to}
            price={existingPair.details.coinPair.price}
            minimumExchangeAmountCoin1={
              existingPair.details.minimumExchangeAmountCoin1
            }
            maximumExchangeAmountCoin1={String(
              existingPair.details.maximumExchangeAmountCoin1,
            )}
            profitCommission={existingPair.details.priceAdjustment}
            priceSource={
              existingPair.pair?.rate_source_options?.serviceName || '-'
            }
            exchangerName={existingPair.details.name}
            onDelete={async () => {
              await handleDelete(existingPair);
              refetch();
            }}
            toggleActive={() => toggleActive(existingPair)}
            active={existingPair.details.active}
            transactionCount={existingPair.details.statistic.transactionCount}
            earnings={{ amount: 0, currency: '', usdEquivalent: 0 }}
            exchangeCommission={0}
            marketPrice={existingPair.details.coinPair.originalPrice}
          />
        </Box>
      )}
      {isBothCoinsSelected && !existingPair && (
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
          <Box sx={{ my: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Price Source</InputLabel>
              <Select
                value={form.values.priceSourceProvider.key}
                onChange={(e) => {
                  const provider = priceSourceProviders.find(
                    (p) => p.key === e.target.value,
                  );
                  form.setValue('priceSourceProvider', provider);
                }}
                label="Price Source"
              >
                {priceSourceProviders.map((provider) => (
                  <MenuItem key={provider.key} value={provider.key}>
                    {provider.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {form.values.priceSourceProvider.key === 'FIXED_RATE' && (
              <VNumericTextField
                margin="normal"
                fullWidth
                label="Fixed Price"
                name="fixedPrice"
                form={form}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {form.values.coin2?.symbol}
                    </InputAdornment>
                  ),
                }}
              />
              // <Box sx={{ mt: 2 }}>
              //   <Typography>
              //     {form.values.coin1?.symbol} ID:{' '}
              //     {priceSourcesCoin1.isLoading
              //       ? 'Loading...'
              //       : getIsoPriceSourceCoin()?.service_currency_iso ||
              //         'Not found'}
              //   </Typography>
              //   <Typography>
              //     {form.values.coin2?.symbol} ID:{' '}
              //     {priceSourcesCoin2.isLoading
              //       ? 'Loading...'
              //       : getIsoPriceSourceCoin({ reversed: true })
              //           ?.service_currency_iso || 'Not found'}
              //   </Typography>
              // </Box>
            )}
          </Box>
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
              defaultExpanded
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction Fee
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="radio"
                        id="transactionFeeType-auto"
                        name="transactionFeeType"
                        value="auto"
                        checked={form.values.transactionFeeType === 'auto'}
                        onChange={() => {
                          form.setValue('transactionFeeType', 'auto');
                          form.setValue('transactionFee', ''); // will be null via advCreate.mutateAsync
                        }}
                      />
                      <label htmlFor="transactionFeeType-auto">
                        Auto (network fee)
                      </label>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="radio"
                        id="transactionFeeType-youPay"
                        name="transactionFeeType"
                        value="youPay"
                        checked={form.values.transactionFeeType === 'youPay'}
                        onChange={() => {
                          form.setValue('transactionFeeType', 'youPay');
                          form.setValue('transactionFee', '0');
                        }}
                      />
                      <label htmlFor="transactionFeeType-youPay">
                        You pay network fee for clients
                      </label>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="radio"
                        id="transactionFeeType-fixed"
                        name="transactionFeeType"
                        value="fixed"
                        checked={form.values.transactionFeeType === 'fixed'}
                        onChange={() => {
                          form.setValue('transactionFeeType', 'fixed');
                          form.setValue('transactionFee', '');
                        }}
                      />
                      <label htmlFor="transactionFeeType-fixed">
                        Fixed fee
                      </label>
                    </Box>
                    {form.values.transactionFeeType === 'fixed' && (
                      <TextFieldWithValidation
                        fullWidth
                        type="number"
                        form={form}
                        name="transactionFee"
                        label={`Enter your fixed fee (${form.values.coin2?.symbol})`}
                        onChange={(e) => e.target.value}
                        onWheel={(e) => e.target.blur()}
                      />
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Button
              type="submit"
              fullWidth
              gradient
              color="primary"
              disabled={Boolean(form.primaryError)}
              sx={{ mt: 3, mb: 2 }}
              data-testid="btn-create-advert"
            >
              {form.primaryError || 'Create Advert'}
            </Button>
          </>
        </>
      )}
    </Box>
  );
};

export default CreateAdvertForm;
