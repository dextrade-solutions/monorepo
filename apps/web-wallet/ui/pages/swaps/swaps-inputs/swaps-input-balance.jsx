import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { NetworkNames } from '../../../../shared/constants/exchanger';
import { calcTokenAmount } from '../../../../shared/lib/transactions-controller-utils';
import { Text } from '../../../components/component-library';
import Box from '../../../components/ui/box';
import Tooltip from '../../../components/ui/tooltip';
import {
  AlignItems,
  DISPLAY,
  JustifyContent,
  TextColor,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenFiatAmount } from '../../../hooks/useTokenFiatAmount';
import { getUseCurrencyRateCheck } from '../../../selectors';

export const SwapsInputBalance = ({ selectedCoinFrom: fromToken }) => {
  const t = useI18nContext();
  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);

  const isFiat = useMemo(
    () => fromToken?.coin?.networkName?.value === NetworkNames.fiat,
    [fromToken],
  );
  const balance = useMemo(
    () =>
      calcTokenAmount(fromToken?.balance || 0, fromToken?.decimals).toNumber(),
    [fromToken],
  );

  const swapFromTokenFiatValue = useTokenFiatAmount(
    fromToken?.address,
    balance || 0,
    fromToken?.symbol,
    {
      showFiat: useCurrencyRateCheck,
    },
    true,
  );

  const disabledBalance = false;

  return (
    <>
      {!isFiat && !disabledBalance && (
        <Box
          display={DISPLAY.FLEX}
          justifyContent={JustifyContent.spaceBetween}
          alignItems={AlignItems.center}
          className="swap-inputs__balance"
          gap={12}
        >
          <Text color={TextColor.textMuted}>{t('balance')}&#58;</Text>
          <Tooltip
            disabled={!swapFromTokenFiatValue}
            title=""
            position="top"
            html={
              <Text color={TextColor.textMuted}>{swapFromTokenFiatValue}</Text>
            }
          >
            <Text color={TextColor.textMuted}>
              {fromToken ? (
                <>
                  {balance}&nbsp;{fromToken?.symbol}
                </>
              ) : (
                '-'
              )}
            </Text>
          </Tooltip>
        </Box>
      )}
    </>
  );
};

SwapsInputBalance.propTypes = {
  selectedCoinFrom: PropTypes.object,
};
