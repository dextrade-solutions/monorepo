import { isEqual } from 'lodash';
import React, { memo, useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  getFromToken,
  getSwapOTC,
  getToToken,
  mountSwapsOTC,
  unmountSwapsOTC,
} from '../../../ducks/swaps/swaps';
import { BUILD_QUOTE_ROUTE } from '../../../helpers/constants/routes';
import { useOTCExchangerRate } from '../hooks/useOTCExchangerRate';
import { setDefaultSwapsActiveTabName } from '../../../store/actions';
import { EXCHANGER_TAB_NAME } from '../build-quote/exchanges-tabs';
import OtcExchangeInputs from './otc-exchange-inputs';
import OtcExchangeContent from './otc-exchange-content';
import OtcExchangeFooter from './otc-exchange-footer';

const OtcExchangeComponent = ({ provider }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { initialized, providers, loading } = useSelector(getSwapOTC);
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);

  const [errors, setErrors] = useState({
    from: null,
    to: null,
  });

  useOTCExchangerRate();

  const providerInstance = useMemo(
    () => providers[provider],
    [providers, provider],
  );

  const isInaccessibleProvider = useMemo(
    () => initialized && !providers[provider],
    [initialized, providers, provider],
  );

  const isEmptyToken = useMemo(
    () => !fromToken || !toToken,
    [fromToken, toToken],
  );

  const onError = useCallback(
    (key, err) => {
      if (errors[key] === err) {
        return;
      }
      setErrors({ ...errors, [key]: err });
    },
    [errors],
  );

  useEffect(() => {
    dispatch(mountSwapsOTC());
    return () => {
      dispatch(unmountSwapsOTC());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isInaccessibleProvider || isEmptyToken) {
      dispatch(setDefaultSwapsActiveTabName(EXCHANGER_TAB_NAME.OTC));
      history.push(BUILD_QUOTE_ROUTE);
    }
  }, [isInaccessibleProvider, isEmptyToken, dispatch, history]);

  if (!initialized && loading) {
    return <div>Loading ...</div>;
  }

  if (isInaccessibleProvider || isEmptyToken) {
    return <span>No available tokens value</span>;
  }

  return (
    <div className="p2p-exchange">
      <div className="p2p-exchange__content">
        <OtcExchangeInputs
          provider={providerInstance}
          errors={errors}
          onError={onError}
        />
        <OtcExchangeContent provider={providerInstance} />
      </div>
      <OtcExchangeFooter
        provider={providerInstance}
        errors={errors}
        loading={loading}
      />
    </div>
  );
};

export default memo(OtcExchangeComponent);
