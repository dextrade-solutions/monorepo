import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ConfirmTransactionBase from '../confirm-transaction-base';
import {
  formatCurrency,
  convertTokenToFiat,
  addFiat,
  roundExponential,
} from '../../helpers/utils/confirm-tx.util';
import { getCurrentCurrency } from '../../selectors';
import { getConversionRate } from '../../ducks/metamask/metamask';
import { TokenStandard } from '../../../shared/constants/transaction';
import { hexWEIToDecETH } from '../../../shared/modules/conversion.utils';

export default function ConfirmTokenTransactionBase({
  image = '',
  assetName,
  toAddress,
  tokenAddress,
  tokenAmount = '0',
  tokenSymbol,
  tokenId,
  assetStandard,
  onEdit,
  ethTransactionTotal,
  fiatTransactionTotal,
  hexMaximumTransactionFee,
  nativeCurrency,
  nativeDecimals,
}) {
  const currentCurrency = useSelector(getCurrentCurrency);
  const { conversionRate } = useSelector((state) =>
    getConversionRate(state, tokenSymbol),
  );

  const ethTransactionTotalMaxAmount = Number(
    hexWEIToDecETH(hexMaximumTransactionFee),
  );

  let title, subtitle;
  if (
    assetStandard === TokenStandard.ERC721 ||
    assetStandard === TokenStandard.ERC1155
  ) {
    title = assetName;
    subtitle = `#${tokenId}`;
  } else {
    title = `${tokenAmount} ${tokenSymbol}`;
  }
  const fiatTransactionAmount = convertTokenToFiat({
    value: tokenAmount,
    toCurrency: currentCurrency,
    conversionRate,
  });

  const secondaryTotalTextOverride = useMemo(() => {
    const fiatTotal = addFiat(fiatTransactionAmount, fiatTransactionTotal);
    const roundedFiatTotal = roundExponential(fiatTotal);
    return formatCurrency(roundedFiatTotal, currentCurrency);
  }, [currentCurrency, fiatTransactionTotal, fiatTransactionAmount]);

  const subtitleComponent = () => {
    if (subtitle) {
      return <span>{subtitle}</span>;
    }
    return (
      <span>{formatCurrency(fiatTransactionAmount, currentCurrency)}</span>
    );
  };

  return (
    <ConfirmTransactionBase
      toAddress={toAddress}
      image={image}
      onEdit={onEdit}
      tokenAddress={tokenAddress}
      title={title}
      subtitleComponent={subtitleComponent()}
      nativeCurrency={nativeCurrency}
      nativeDecimals={nativeDecimals}
      primaryTotalTextOverride={`${title} + ${ethTransactionTotal} ${nativeCurrency}`}
      primaryTotalTextOverrideMaxAmount={`${title} + ${ethTransactionTotalMaxAmount} ${nativeCurrency}`}
      secondaryTotalTextOverride={secondaryTotalTextOverride}
    />
  );
}

ConfirmTokenTransactionBase.propTypes = {
  image: PropTypes.string,
  assetName: PropTypes.string,
  toAddress: PropTypes.string,
  tokenAddress: PropTypes.string,
  tokenAmount: PropTypes.string,
  tokenSymbol: PropTypes.string,
  tokenId: PropTypes.string,
  assetStandard: PropTypes.string,
  onEdit: PropTypes.func,
  ethTransactionTotal: PropTypes.string,
  fiatTransactionTotal: PropTypes.string,
  hexMaximumTransactionFee: PropTypes.string,
  nativeCurrency: PropTypes.string,
  nativeDecimals: PropTypes.number,
};
