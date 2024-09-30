import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import { formatLongAmount } from '../../../../shared/lib/ui-utils';
import {
  AlignItems,
  BLOCK_SIZES,
  DISPLAY,
  JustifyContent,
  TEXT_ALIGN,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getAssetModel } from '../../../store/actions';
import { Text } from '../../component-library';
import Box from '../../ui/box';
import Button from '../../ui/button';
import CopyData from '../../ui/copy-data';

export default function TransactionSwapDEXDetails({ txData }) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const fromAsset = dispatch(getAssetModel(txData.source));
  const toAsset = dispatch(getAssetModel(txData.destination));

  const handleBlockExplorerClick = (hash, asset) => {
    const blockExplorerLink = asset.sharedProvider.getBlockExplorerLink(hash);
    global.platform.openTab({
      url: blockExplorerLink,
    });
  };

  const { exchangerSettings = {} } = txData;

  return (
    <Box paddingBottom={3} paddingLeft={3} paddingRight={3}>
      <Text display={DISPLAY.FLEX}>
        <span className="flex-grow">{t('exchanger')}</span>
        <span>{txData.exchangerType}</span>
      </Text>
      <Text display={DISPLAY.FLEX}>
        <span className="flex-grow">{t('provider')}</span>
        <span>{txData.origin}</span>
      </Text>

      <Text display={DISPLAY.FLEX}>
        <span className="flex-grow">{t('transactionFee')}</span>
        <span>
          {exchangerSettings.transactionFee
            ? `${exchangerSettings.transactionFee} ${toAsset.symbol}`
            : t('auto')}
        </span>
      </Text>
      {exchangerSettings.rate && (
        <Text display={DISPLAY.FLEX}>
          <span className="flex-grow">{t('rate')}</span>
          <span>
            {exchangerSettings.rate}&nbsp;
            {exchangerSettings.rateType}
          </span>
        </Text>
      )}

      <Text display={DISPLAY.FLEX}>
        <strong className="flex-grow">You give</strong>
        <Text>
          {formatLongAmount(txData.swapMetaData.token_from_amount)}{' '}
          {fromAsset.symbol}
        </Text>
      </Text>

      <Text display={DISPLAY.FLEX}>
        <strong className="flex-grow">You get</strong>
        <Text>
          {formatLongAmount(txData.swapMetaData.token_to_amount)}{' '}
          {toAsset.symbol}
        </Text>
      </Text>

      {txData.hash && (
        <>
          <Box
            marginTop={3}
            display={DISPLAY.FLEX}
            textAlign={TEXT_ALIGN.CENTER}
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
                onClick={() => handleBlockExplorerClick(txData.hash, fromAsset)}
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
  );
}

TransactionSwapDEXDetails.propTypes = {
  txData: PropTypes.object.isRequired,
};
