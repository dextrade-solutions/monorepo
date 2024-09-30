import React, { memo, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getSwapOTC,
  mountSwapsOTC,
  unmountSwapsOTC,
} from '../../../../ducks/swaps/swaps';
import { useOTCExchangerRate } from '../../hooks/useOTCExchangerRate';
import SwapsInputs from '../../swaps-inputs/swaps-inputs.component';
import OtcExchangesFilter from './otc-exchanges-filter';
import OtcExchangesProviders from './otc-exchanges-providers';

const OtcExchangesInner = () => {
  useOTCExchangerRate();

  return (
    <>
      <div className="quote-inputs">
        <SwapsInputs />
      </div>
      <OtcExchangesFilter />
      <div className="build-quote__exchangers">
        <OtcExchangesProviders />
      </div>
    </>
  );
};

const OtcExchangesComponent = (props) => {
  const dispatch = useDispatch();
  const { initialized, providers } = useSelector(getSwapOTC);

  const showOtcTab = useMemo(
    () => initialized && Object.keys(providers).length,
    [initialized, providers],
  );

  useEffect(() => {
    dispatch(mountSwapsOTC());
    return () => {
      dispatch(unmountSwapsOTC());
    };
  }, [dispatch]);

  if (!showOtcTab) {
    return <p>not available providers</p>;
  }

  return <OtcExchangesInner {...props} />;
};

export default memo(OtcExchangesComponent);
