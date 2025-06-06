import { config } from './config';
import { PaybisClient } from './paybis-api-client';
import { usePaybis } from './paybis-react-component';
import { useForm } from '../../../hooks/useForm';

type WidgetParams = {
  mode: 'buy' | 'sell';
  fiatId: number;
  cryptoId: number;
  amount?: string;
  receiveAmount?: string;
  walletAddress: string;
};

export const usePaybisForm = () => {
  return useForm({
    method: async (
      _,
      {
        mode,
        walletAddress,
        amount,
        receiveAmount,
        fiatId,
        cryptoId,
      }: WidgetParams,
    ) => {
      const client = new PaybisClient(config);

      const payload: Record<string, string | number | boolean> = {
        defaultAmount: amount || receiveAmount,
        buy_on: receiveAmount,
        walletAddress,
        defaultCrypto: cryptoId,
        sell_defaultCrypto: cryptoId,
        defaultFiat: fiatId,
        sell_defaultFiat: fiatId,
      };

      const urlData = await client.createWidgetUrl(payload, mode);
      window.open(urlData.url, '_blank');
    },
  });
};
