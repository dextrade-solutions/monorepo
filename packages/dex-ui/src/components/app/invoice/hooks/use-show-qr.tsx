import { QRCode } from '../../../ui';
import { useGlobalModalContext } from '../../modals';
import { Invoice } from '../types/invoices';

export function useShowQr() {
  const { showModal } = useGlobalModalContext();
  const getQRValue = (invoice: Invoice.View.Response) => {
    if (!invoice.address || !invoice.amount_requested_f) {
      throw new Error('getQRValue - no address or amount provided');
    }

    const { address } = invoice;
    const currencyIso = invoice.currency?.native_currency_iso?.toLowerCase();

    if (currencyIso === 'btc') {
      return `bitcoin:${address}?amount=${invoice.amount_requested_f}`;
    } else if (
      currencyIso === 'eth' ||
      currencyIso === 'bsc' ||
      currencyIso === 'bnb'
    ) {
      const weiAmount = BigInt(
        Number(invoice.amount_requested_f) * 1e18,
      ).toString();

      if (currencyIso === 'bsc' || currencyIso === 'bnb') {
        return `binance:${address}?amount=${weiAmount}`;
      }
      return `ethereum:${address}?value=${weiAmount}`;
    } else if (currencyIso === 'trx') {
      return `tron:${address}?amount=${invoice.amount_requested_f}`;
    }

    return address;
  };

  return (invoice: Invoice.View.Response) =>
    showModal({
      component: () => (
        <QRCode
          description={`Use QR-code scanner in your wallet, to send ${invoice.amount_requested_f} ${invoice.currency.iso} to the address below.`}
          value={getQRValue(invoice)}
        />
      ),
    });
}
