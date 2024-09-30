import { isEqual } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Loading from '../../../components/ui/loading-screen';
import {
  getFromToken,
  getFromTokenInputValue,
  getSwapDEX,
  getToToken,
  mountSwapsDEX,
  setSwapHeaderTitle,
  unmountSwapsDEX,
} from '../../../ducks/swaps/swaps';
import { BUILD_QUOTE_ROUTE } from '../../../helpers/constants/routes';
import { setDefaultSwapsActiveTabName } from '../../../store/actions';
import { EXCHANGER_TAB_NAME } from '../build-quote/exchanges-tabs';
import { useDEXExchangerRate } from '../hooks/useDEXExchangerRate';
import OtcExchangeInputs from '../view-otc-exchange/otc-exchange-inputs';
import DexExchangeContent from './dex-exchange-content';
import DexExchangeFooter from './dex-exchange-footer';

// TODO: refactor dex/otc. Create HOC/wrapper
const DexExchangeComponent = ({ provider }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { initialized, providers, loading } = useSelector(getSwapDEX);
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const fromInputValue = useSelector(getFromTokenInputValue);
  const [customApproveValue, setCustomApproveValue] = useState();

  const [errors, setErrors] = useState({
    from: null,
    to: null,
  });

  useDEXExchangerRate(provider);

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
    dispatch(mountSwapsDEX());
    return () => {
      dispatch(unmountSwapsDEX());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setSwapHeaderTitle(providerInstance?.name));
  }, [dispatch, providerInstance]);

  useEffect(() => {
    if (isInaccessibleProvider || isEmptyToken) {
      dispatch(setDefaultSwapsActiveTabName(EXCHANGER_TAB_NAME.DEX));
      history.push(BUILD_QUOTE_ROUTE);
    }
  }, [isInaccessibleProvider, isEmptyToken, dispatch, history]);

  if (!initialized && loading) {
    return <Loading />;
  }

  if (isInaccessibleProvider || isEmptyToken) {
    return <span>No available tokens value</span>;
  }

  return (
    <div className="p2p-exchange">
      {loading && <Loading />}
      <div className="p2p-exchange__content">
        <OtcExchangeInputs
          provider={providerInstance}
          errors={errors}
          onError={onError}
        />
        <DexExchangeContent
          provider={providerInstance}
          setCustomApproveValue={setCustomApproveValue}
        />
      </div>
      <DexExchangeFooter
        customApproveValue={customApproveValue}
        provider={providerInstance}
        errors={errors}
        loading={loading}
      />
    </div>
  );
};

export default memo(DexExchangeComponent);
