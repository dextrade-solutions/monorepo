import { formatFundsAmount } from 'dex-helpers';

export default function AssetPriceOutput({ price, tickerFrom, tickerTo }) {
  let outputPrice = price;
  let outputTicker = tickerFrom;
  if (price < 1) {
    outputPrice = 1 / price;
    outputTicker = tickerTo;
  }
  return formatFundsAmount(outputPrice, outputTicker);
}
