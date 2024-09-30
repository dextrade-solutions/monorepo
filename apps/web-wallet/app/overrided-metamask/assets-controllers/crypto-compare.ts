// /**
//  * Get the CryptoCompare API URL for getting the conversion rate from the given native currency to
//  * the given currency. Optionally, the conversion rate from the native currency to USD can also be
//  * included in the response.
//  *
//  * @param currentCurrency - The currency to get a conversion rate for.
//  * @param fromCurrency - The native currency to convert from.
//  * @returns The API URL for getting the conversion rate.

import { handleFetch } from '../controller-utils';

//  */
async function cryptoCompareQuery(fromList: string[], currentCurrency: string) {
  const toCurrency =
    currentCurrency.toLowerCase() === 'usd'
      ? 'USDT'
      : currentCurrency.toUpperCase();

  const usdQuery = toCurrency === 'USDT' ? '' : ',USDT';

  const { data: result } = await handleFetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fromList}&tsyms=${toCurrency}${usdQuery}`,
  );

  /*
  Example expected error response (if pair is not found)
  {
    Response: "Error",
    Message: "cccagg_or_exchange market does not exist for this coin pair (ETH-<NON_EXISTENT_TOKEN>)",
    HasWarning: false,
  }
  */
  if (result.Response === 'Error') {
    throw new Error(result.Message);
  }
  const currencyPairs = Object.entries(result).reduce(
    (acc, [currency, value]: [string, any]) => ({
      ...acc,
      [currency]: {
        conversionRate: value[toCurrency],
        usdConversionRate: value.USDT,
      },
    }),
    {},
  );

  return {
    USDT: {
      conversionRate: 1,
      usdConversionRate: 1,
    },
    ...currencyPairs,
  };
}

async function binanceQuery(fromList: string[], currentCurrency: string) {
  const toCurrency =
    currentCurrency.toLowerCase() === 'usd'
      ? 'USDT'
      : currentCurrency.toUpperCase();
  const tickersAliasesPairs = fromList.reduce(
    (acc, ticker) => ({
      ...acc,
      [ticker.toUpperCase() + toCurrency]: ticker,
    }),
    {},
  );
  // const query = Object.keys(tickersAliasesPairs)
  //   .filter((v) => v !== 'USDTUSDT')
  //   .map((v) => `"${v}"`);
  // const queryString = `?symbols=[${query}]`;
  const result = await handleFetch(
    `https://api.binance.com/api/v3/ticker/price`,
  );

  /*
  Example expected error response (if pair is not found)
  {
    Response: "Error",
    Message: "cccagg_or_exchange market does not exist for this coin pair (ETH-<NON_EXISTENT_TOKEN>)",
    HasWarning: false,
  }
  */
  if (result.Response === 'Error') {
    throw new Error(result.Message);
  }

  const currencyPairs = result.reduce(
    (acc: any, { symbol, price }: { symbol: string; price: string }) => ({
      ...acc,
      [(tickersAliasesPairs as any)[symbol]]: {
        conversionRate: parseFloat(price),
        usdConversionRate: null,
      },
    }),
    {},
  );
  currencyPairs.USDT = {
    conversionRate: 1,
    usdConversionRate: 1,
  };
  return currencyPairs;
}

/**
 * Fetches the exchange rates for a given currencies.
 *
 * @param currency - ISO 4217 currency code.
 * @param fromCurrencies - Currencies list to convertation.
 * @returns Promise resolving to exchange rate for given currency.
 */
export async function fetchExchangeRate(
  currency: string,
  fromCurrencies: string[],
): Promise<{
  [key: string]: {
    conversionRate: number;
    usdConversionRate: number;
  };
}> {
  return cryptoCompareQuery(fromCurrencies, currency);
}
