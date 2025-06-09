import { Box, Divider } from '@mui/material';
import { ExchangerRateSources, TransactionFeeType } from 'dex-helpers';
import assetsList from 'dex-helpers/assets-list';
import { AssetModel, PaymentMethod } from 'dex-helpers/types';
import { coinPairsService, exchangerService } from 'dex-services';
import {
  AdForm,
  AssetItem,
  NumericTextField,
  useGlobalModalContext,
  Button,
  ButtonIcon,
} from 'dex-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AdvertFormValues } from '../../../../../packages/dex-ui/src/components/app/ad-form/ad-form';
import { SETTINGS_ROUTE } from '../../helpers/constants/routes';

type WalletConnection = {
  address: string;
  network: string;
};

interface SetCryptoReserveProps {
  onChange: (v: number) => void;
  asset: AssetModel;
  hideModal: () => void;
}

const SetCryptoReserve: React.FC<SetCryptoReserveProps> = ({
  onChange,
  asset,
  hideModal,
}) => {
  debugger;
  const { t } = useTranslation();
  const [value, setValue] = React.useState('');

  const handleConfirm = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange(numValue);
      hideModal();
    }
  };

  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <AssetItem asset={asset} />

        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={hideModal}
          ariaLabel={t('close')}
        />
      </Box>

      <Box marginY={1}>
        <Divider />
      </Box>

      <NumericTextField
        value={value}
        onChange={setValue}
        placeholder="0"
        InputProps={{
          endAdornment: asset.symbol,
        }}
      />

      <Box display="flex" justifyContent="flex-end" marginTop={3}>
        <Button onClick={hideModal} sx={{ mr: 2 }}>
          {t('Cancel')}
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          {t('Confirm')}
        </Button>
      </Box>
    </Box>
  );
};

export default function AdCreate() {
  const navigate = useNavigate();
  const { showModal } = useGlobalModalContext();

  const setAsset = async (asset: AssetModel, isToAsset?: boolean) => {
    return new Promise((resolve) => {
      if (asset.isFiat) {
        showModal({
          name: 'SET_PAYMENT_METHOD',
          asset,
          onChange: (v: PaymentMethod[]) => {
            resolve({ paymentMethods: v });
          },
        });
      } else if (isToAsset) {
        showModal({
          name: 'SET_WALLET',
          asset,
          allowPasteAddress: true,
          isToAsset,
          onChange: (v: WalletConnection) => {
            resolve({ wallet: v });
          },
        });
      } else {
        resolve({ wallet: null });
      }
    });
  };

  const getAssetCoin = (asset: AssetModel) => {
    return {
      ticker: asset.symbol,
      tokenName: asset.name,
      uuid: asset.uid || '',
      networkName: asset.network,
      networkType: asset.standard,
    };
  };

  return (
    <AdForm
      onSubmit={async (values: AdvertFormValues) => {
        const sendPaymentMethod = await setAsset(values.merchantSends?.asset);
        const recievePaymentMethod = await setAsset(
          values.merchantReceives?.asset,
          true,
        );

        if (!values.merchantSends?.asset.isFiat) {
          await new Promise((resolve) => {
            showModal({
              component: () => (
                <SetCryptoReserve
                  asset={values.merchantSends?.asset}
                  onChange={(v) => resolve({ reserve: v })}
                  // hideModal={() => showModal({ name: '' })}
                />
              ),
            });
          });
        }

        const merchantSendCoin = getAssetCoin(values.merchantSends?.asset);
        const merchantRecieveCoin = getAssetCoin(
          values.merchantReceives?.asset,
        );

        const data = {
          active: true,
          coinPair: {
            currencyAggregator: values.coinPair.currencyAggregator,
            id: values.coinPair.currencyAggregatorId,
          },
          from: merchantSendCoin,
          priceAdjustment: values.coinPair.priceAdjustment || 0,
          reserve: [
            {
              coin: merchantRecieveCoin,
            },
          ],
          slippage: 20.0,
          to: merchantRecieveCoin,
          tradeWithKycUsers: false,
          minimumExchangeAmountCoin1: values.merchantReceives.amountLimits?.min,
          maximumExchangeAmountCoin1: values.merchantReceives.amountLimits?.max,
          paymentMethods:
            sendPaymentMethod.paymentMethods ||
            recievePaymentMethod.paymentMethods,
          walletAddress: sendPaymentMethod.wallet?.address,
          walletAddressInNetwork2: recievePaymentMethod.wallet?.address,
          transactionFeeType:
            values.coinPair.feeType || TransactionFeeType.network,
          transactionFeeFixedValue: values.coinPair.fee,
        };
        await exchangerService.saveExchangerSettings(data);
        navigate(SETTINGS_ROUTE);
      }}
      getRatesFetch={(fromTicker: string, toTicker: string) => {
        return coinPairsService
          .listCurrencyByPair1({
            nameFrom: fromTicker,
            nameTo: toTicker,
          })
          .then((r) => {
            return r.data.aggregators;
          });
      }}
      merchantSendsAssets={{ items: assetsList }}
      merchantReceivesAssets={{ items: assetsList }}
    />
  );
}
