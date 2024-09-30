import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { isEqual } from 'lodash';

import LoadingScreen from '../../../components/ui/loading-screen';
import { getP2PExchanges } from '../../../ducks/swaps/swaps';
import { useAssets } from '../../../hooks/useAssets';
import P2PExchange from './p2p-exchange';

export default function P2PProvider({ id }) {
  const dispatch = useDispatch();
  const [toAsset, setToAsset] = useState(null);
  const [fromAsset, setFromAsset] = useState(null);
  const { items: exchanges } = useSelector(getP2PExchanges, isEqual);
  const { findToken } = useAssets({ includeFiats: true });

  const selectedExchange = useMemo(
    () => exchanges.find((i) => i.id === Number(id)),
    [exchanges, id],
  );

  const { fromCoin, toCoin } = selectedExchange || {};

  useEffect(() => {
    if (toCoin && fromCoin) {
      const foundedFromAsset = findToken(fromCoin.ticker, fromCoin.networkName);
      const foundedToAsset = findToken(toCoin.ticker, toCoin.networkName);

      if (foundedFromAsset && !foundedFromAsset.isFiat) {
        dispatch(foundedFromAsset.addToWallet.bind(foundedFromAsset));
      }

      if (foundedToAsset && !foundedToAsset.isFiat) {
        dispatch(foundedToAsset.addToWallet.bind(foundedToAsset));
      }

      setFromAsset({
        value: foundedFromAsset,
        coin: fromCoin,
      });

      setToAsset({
        value: foundedToAsset,
        coin: toCoin,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, toCoin, fromCoin]);

  if (!toAsset || !fromAsset || !selectedExchange) {
    return <LoadingScreen />;
  }

  return (
    <P2PExchange
      exchange={selectedExchange}
      toAsset={toAsset}
      fromAsset={fromAsset}
    />
  );
}

P2PProvider.propTypes = {
  id: PropTypes.string,
};
