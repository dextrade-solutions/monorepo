import { isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getFromToken,
  getSwapOTC,
  getSwapOTCProviders,
  getToToken,
} from '../../../../ducks/swaps/swaps';
import { VIEW_OTC_ROUTE } from '../../../../helpers/constants/routes';
import { ProvidersItem, ProvidersList } from '../providers';

const OtcExchangesProviders = () => {
  const history = useHistory();
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const list = useSelector(getSwapOTCProviders);
  const { loading } = useSelector(getSwapOTC);

  // TODO: refactor method
  const handleRedirectClick = useCallback(
    (provider) => {
      if (loading || !provider) {
        return;
      }
      if (!fromToken || !toToken) {
        // TODO: create toast hooks/ locale this
        toast.error('Select all coins');
        return;
      }
      const {
        provider: providerName,
        name,
        error,
        minAmount,
        fromAmount,
      } = provider;
      if (error && fromAmount >= minAmount) {
        // TODO: create toast hooks
        toast.error(`[${name}] ${error}`);
        return;
      }
      history.push(`${VIEW_OTC_ROUTE}/${providerName}`);
    },
    [fromToken, toToken, history, loading],
  );

  return (
    <ProvidersList list={list} getItemKey={({ name }) => name}>
      {({ provider }) => (
        <ProvidersItem
          provider={provider}
          onClick={handleRedirectClick}
          disabled={!fromToken || !toToken}
          loading={loading}
        />
      )}
    </ProvidersList>
  );
};

export default memo(OtcExchangesProviders);
