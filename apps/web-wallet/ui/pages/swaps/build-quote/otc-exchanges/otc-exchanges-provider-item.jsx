import classnames from 'classnames';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import currencyFormatter from 'currency-formatter';
import LoadingSkeleton from '../../../../components/ui/loading-skeleton';
import UrlIcon from '../../../../components/ui/url-icon';
import { getFromToken, getToToken } from '../../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const getImageUrl = (image) => (image ? `./images/exchangers/${image}.svg` : null);

const OtcExchangesProviderItem = ({ provider, disabled, loading, onClick }) => {
  const {
    name,
    image,
    error,
    message,
    minAmount,
    toAmount = null,
    rate,
  } = provider;
  const t = useI18nContext();
  const amountRef = useRef(null);
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);

  const providerError = useMemo(() => error || message, [error, message]);

  const toTokenType = useMemo(
    () =>
      toToken &&
      toToken.network?.name &&
      toToken.network?.type &&
      toToken.network?.name !== toToken.network?.type &&
      toToken.network?.type,
    [toToken],
  );

  const formattedToAmount = useMemo(
    () =>
      toAmount &&
      currencyFormatter.format(Number(toAmount), { locale: 'en-US' }),
    [toAmount],
  );

  const handleClick = useCallback(
    (e) => {
      e?.preventDefault();
      e?.nativeEvent?.stopImmediatePropagation();
      if (loading) {
        return;
      }
      onClick(provider);
    },
    [onClick, provider, loading],
  );

  return (
    <div
      className={classnames('otc-exchanges__provider', {
        'otc-exchanges__provider--error': Boolean(providerError) && !disabled,
        'otc-exchanges__provider--disabled': disabled,
      })}
      onClick={handleClick}
    >
      <div className="otc-exchanges__provider_inner">
        <div className="otc-exchanges__provider__info">
          <UrlIcon
            url={getImageUrl(image)}
            className="otc-exchanges__provider__info__icon"
            name={name}
          />
          <div className="otc-exchanges__provider__info__name">{name}</div>
        </div>
        <div className="otc-exchanges__provider__content">
          {Boolean(providerError) &&
            Boolean(fromToken) &&
            minAmount &&
            !disabled && (
              <LoadingSkeleton isLoading={loading}>
                <div className="otc-exchanges__provider__content__min">
                  <span>{t('swapsMinAmount')}&#58;</span>
                  <span>
                    {minAmount}&nbsp;{fromToken.symbol}
                  </span>
                </div>
              </LoadingSkeleton>
            )}
          {!providerError && toAmount && !disabled && (
            <div className="otc-exchanges__provider__content__description">
              <p className="otc-exchanges__provider__content__description__title">
                {t('youReceive')}&#58;
              </p>
              <LoadingSkeleton isLoading={loading}>
                <p
                  className="otc-exchanges__provider__content__description__amount"
                  ref={amountRef}
                >
                  &#126;&nbsp;{formattedToAmount}&nbsp;{toToken?.symbol}
                </p>
              </LoadingSkeleton>
            </div>
          )}
        </div>
      </div>
      {!providerError && rate && !disabled && (
        <div className="otc-exchanges__provider__rate">
          <span>{t('swapsExchangeRate')}&#58;</span>
          <LoadingSkeleton isLoading={loading}>
            <div className="otc-exchanges__provider__rate__info">
              <span>1&nbsp;</span>
              <span>{fromToken.symbol}</span>
              <span>&#8776;</span>
              <span>{rate}&nbsp;</span>
              <span>{toToken.symbol}</span>
            </div>
          </LoadingSkeleton>
        </div>
      )}
      {Boolean(providerError) && !disabled && (
        <div className="otc-exchanges__provider__error">
          <LoadingSkeleton isLoading={loading}>
            <div className="otc-exchanges__provider__error__text">
              {providerError}
            </div>
          </LoadingSkeleton>
        </div>
      )}
    </div>
  );
};

OtcExchangesProviderItem.propTypes = {
  provider: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    error: PropTypes.string,
    message: PropTypes.string,
    minAmount: PropTypes.number,
    toAmount: PropTypes.number,
    rate: PropTypes.number,
  }),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default memo(OtcExchangesProviderItem);
