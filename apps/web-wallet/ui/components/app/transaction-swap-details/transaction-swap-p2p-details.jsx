import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatLongAmount } from '../../../../shared/lib/ui-utils';
import {
  AlignItems,
  BLOCK_SIZES,
  BorderRadius,
  Color,
  DISPLAY,
  JustifyContent,
  TEXT_ALIGN,
  TextColor,
} from '../../../helpers/constants/design-system';
import { Text } from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';

import Box from '../../ui/box';
import Button from '../../ui/button';
import CopyData from '../../ui/copy-data';
import StepProgressBarNew from '../step-progress-bar-new';
import { P2P_STAGES } from '../step-progress-bar-new/stages';
import { useAsset } from '../../../hooks/useAsset';
import { ExchangerType } from '../../../../shared/constants/exchanger';
import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import { handleBackgroundSubmit } from '../../../store/actions';
import { TransactionType } from '../../../../shared/constants/transaction';

export default function TransactionSwapP2PDetails({ txData }) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const fromAsset = useAsset(txData.source);
  const toAsset = useAsset(txData.destination);
  const [pnlOutput, setPnlOutput] = useState(0);

  const handleBlockExplorerClick = (hash, asset) => {
    const blockExplorerLink = asset.sharedProvider.getBlockExplorerLink(hash);
    global.platform.openTab({
      url: blockExplorerLink,
    });
  };

  const { exchangerSettings = {} } = txData;

  let pnls;
  let outputPNL;

  if (exchangerSettings.statistic?.transactionCount === 1) {
    pnls = [
      formatLongAmount(
        exchangerSettings.statistic.amountInCoinFrom,
        toAsset.symbol,
      ),
      formatLongAmount(
        exchangerSettings.statistic.amountInCoinTo,
        fromAsset.symbol,
      ),
      formatLongAmount(exchangerSettings.statistic.amountInBTC, 'BTC'),
      formatLongAmount(exchangerSettings.statistic.amountInETH, 'ETH'),
      formatCurrency(exchangerSettings.statistic.amountInUsdt, 'usd'),
    ];
    outputPNL = pnls[pnlOutput];
  }
  const isAtomicTx = txData.type === TransactionType.atomicSwap;

  const fromRefunded = txData.fromSafe?.data?.refunded;
  const fromClaimed = txData.fromSafe?.data?.claimed;
  const toRefunded = txData.toSafe?.data?.refunded;
  const toClaimed = txData.toSafe?.data?.claimed;

  const canRefundSwap = !fromClaimed && !fromRefunded && !toRefunded;

  return (
    <Box>
      <Box paddingBottom={3} paddingLeft={3} paddingRight={3}>
        <Box
          display={DISPLAY.FLEX}
          textAlign={TEXT_ALIGN.RIGHT}
          alignItems={AlignItems.center}
          width={BLOCK_SIZES.FULL}
        >
          <Text textAlign={TEXT_ALIGN.LEFT} className="flex-grow nowrap">
            Exchanger
          </Text>
          <CopyData
            className="flex-shrink"
            data={exchangerSettings?.exchangerName || ''}
          />
        </Box>
        <Box
          display={DISPLAY.FLEX}
          textAlign={TEXT_ALIGN.RIGHT}
          alignItems={AlignItems.center}
          width={BLOCK_SIZES.FULL}
        >
          <Text textAlign={TEXT_ALIGN.LEFT} className="flex-grow nowrap">
            Exchange ID
          </Text>
          <CopyData
            className="flex-shrink"
            data={exchangerSettings?.exchangeId || ''}
          />
        </Box>
        <Text display={DISPLAY.FLEX}>
          <span className="flex-grow">{t('transactionFee')}</span>
          <span>
            {exchangerSettings.transactionFee
              ? `${exchangerSettings.transactionFee} ${toAsset.symbol}`
              : t('auto')}
          </span>
        </Text>
      </Box>
      <Box
        marginBottom={3}
        padding={3}
        backgroundColor={Color.backgroundAlternative}
        borderRadius={BorderRadius.XL}
      >
        <StepProgressBarNew
          stages={P2P_STAGES.filter(({ pairTypes }) =>
            pairTypes.includes(txData.pairType),
          )}
          value={exchangerSettings?.status}
        />
      </Box>
      {txData.exchangerType === ExchangerType.P2PExchanger && (
        <Box
          marginBottom={3}
          padding={3}
          backgroundColor={Color.backgroundAlternative}
          borderRadius={BorderRadius.XL}
        >
          {pnls && (
            <Box display={DISPLAY.FLEX}>
              <Text className="flex-grow">PNL</Text>
              <Box textAlign={TEXT_ALIGN.RIGHT}>
                <Text
                  color={TextColor.successDefault}
                  className="cursor-pointer"
                  onClick={() => setPnlOutput((idx) => (idx + 1) % pnls.length)}
                >
                  {`+${outputPNL}`}
                </Text>
              </Box>
            </Box>
          )}
          <Box display={DISPLAY.FLEX}>
            <Text className="flex-grow">Margin profit</Text>
            <Box display={DISPLAY.FLEX}>
              <Text>{exchangerSettings.priceAdjustment}%</Text>
              {exchangerSettings.priceAdjustment > 0 && (
                <Text marginLeft={2} color={TextColor.textAlternative}>
                  {`(${formatLongAmount(
                    (1 / exchangerSettings.priceAdjustment) *
                      txData.swapMetaData.token_to_amount,
                    fromAsset.symbol,
                  )})`}
                </Text>
              )}
            </Box>
          </Box>
          <Box display={DISPLAY.FLEX}>
            <Text className="flex-grow">Currency aggregator</Text>
            <Text>{exchangerSettings.coinPair.currencyAggregator}</Text>
          </Box>
          <Box display={DISPLAY.FLEX}>
            <Text className="flex-grow">Price</Text>
            <Text>{formatLongAmount(exchangerSettings.coinPair.price)}</Text>
          </Box>
          <Box display={DISPLAY.FLEX}>
            <Text className="flex-grow">Market price</Text>
            <Text>
              {formatLongAmount(exchangerSettings.coinPair.originalPrice)}
            </Text>
          </Box>
        </Box>
      )}
      <Box
        marginTop={3}
        marginBottom={3}
        padding={3}
        backgroundColor={Color.backgroundAlternative}
        borderRadius={BorderRadius.XL}
      >
        <Text display={DISPLAY.FLEX}>
          <strong className="flex-grow">You give</strong>
          <Box textAlign={TEXT_ALIGN.RIGHT}>
            <Text>
              {formatLongAmount(
                txData.swapMetaData.token_from_amount,
                fromAsset.symbol,
              )}
            </Text>
            <Text color={TextColor.textAlternative}>
              {formatCurrency(
                txData.swapMetaData.token_from_amount *
                  exchangerSettings.coinPair.priceCoin2InUsdt,
                'usd',
              )}
            </Text>
          </Box>
        </Text>
        {txData.hash && (
          <>
            <Box
              marginTop={3}
              display={DISPLAY.FLEX}
              textAlign={TEXT_ALIGN.RIGHT}
              alignItems={AlignItems.center}
              width={BLOCK_SIZES.FULL}
            >
              <Text textAlign={TEXT_ALIGN.LEFT} className="flex-grow nowrap">
                Hash
              </Text>
              <CopyData className="flex-shrink" data={txData.hash} />
            </Box>
            <Box display={DISPLAY.FLEX} justifyContent={JustifyContent.flexEnd}>
              <Box>
                <Button
                  type="link"
                  onClick={() =>
                    handleBlockExplorerClick(txData.hash, fromAsset)
                  }
                  padding={0}
                  margin={0}
                >
                  {t('viewOnBlockExplorer')}
                </Button>
              </Box>
            </Box>
          </>
        )}

        {isAtomicTx && (
          <Box>
            <Button
              type="primary"
              disabled={!canRefundSwap}
              padding={0}
              margin={0}
              onClick={() =>
                dispatch(
                  handleBackgroundSubmit('refundSwap', { args: [txData] }),
                )
              }
            >
              Refund{' '}
              {formatLongAmount(
                txData.swapMetaData.token_from_amount,
                fromAsset.symbol,
              )}
            </Button>
          </Box>
        )}
      </Box>
      <Box
        marginTop={3}
        marginBottom={3}
        padding={3}
        backgroundColor={Color.backgroundAlternative}
        borderRadius={BorderRadius.XL}
      >
        <Text display={DISPLAY.FLEX}>
          <strong className="flex-grow">You get</strong>
          <Box textAlign={TEXT_ALIGN.RIGHT}>
            <Text>
              {formatLongAmount(txData.swapMetaData.token_to_amount)}{' '}
              {toAsset.symbol}
            </Text>
            <Text color={TextColor.textAlternative}>
              {formatCurrency(
                txData.swapMetaData.token_to_amount *
                  exchangerSettings.coinPair.priceCoin1InUsdt,
                'usd',
              )}
            </Text>
          </Box>
        </Text>

        {txData.receiveHash && (
          <>
            <Box
              display={DISPLAY.FLEX}
              marginTop={3}
              textAlign={TEXT_ALIGN.RIGHT}
              alignItems={AlignItems.center}
              width={BLOCK_SIZES.FULL}
            >
              <Text textAlign={TEXT_ALIGN.LEFT} className="flex-grow nowrap">
                Hash
              </Text>
              <CopyData className="flex-shrink" data={txData.receiveHash} />
            </Box>
            <Box display={DISPLAY.FLEX} justifyContent={JustifyContent.flexEnd}>
              <Box>
                <Button
                  type="link"
                  onClick={() =>
                    handleBlockExplorerClick(txData.receiveHash, toAsset)
                  }
                  padding={0}
                  margin={0}
                >
                  {t('viewOnBlockExplorer')}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

TransactionSwapP2PDetails.propTypes = {
  txData: PropTypes.object.isRequired,
};
