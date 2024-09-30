import React, { memo, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getSwapDEX,
  mountSwapsDEX,
  unmountSwapsDEX,
} from '../../../../ducks/swaps/swaps';
import { useDEXExchangerRate } from '../../hooks/useDEXExchangerRate';
import SwapsInputs from '../../swaps-inputs/swaps-inputs.component';
import DexExchangesProviders from './dex-exchanges-providers';
import DexExchangesFilter from './dex-exchanges-filter';

const DexExchangesInner = () => {
  useDEXExchangerRate();

  return (
    <>
      <div className="quote-inputs">
        <SwapsInputs />
      </div>
      <DexExchangesFilter />
      <div className="build-quote__exchangers">
        <DexExchangesProviders />
      </div>
    </>
  );
};

const DexExchangesComponent = (props) => {
  const dispatch = useDispatch();
  const { initialized, providers } = useSelector(getSwapDEX);

  const showDexTab = useMemo(
    () => initialized && Object.keys(providers).length,
    [initialized, providers],
  );

  useEffect(() => {
    dispatch(mountSwapsDEX());
    return () => {
      dispatch(unmountSwapsDEX());
    };
  }, [dispatch]);

  if (!showDexTab) {
    return <p>not available providers</p>;
  }

  return <DexExchangesInner {...props} />;
};

export default memo(DexExchangesComponent);
