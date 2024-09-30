import { isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getFromToken,
  getSwapDEX,
  getSwapDEXProviders,
  getToToken,
} from '../../../../ducks/swaps/swaps';
import { VIEW_DEX_ROUTE } from '../../../../helpers/constants/routes';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ProvidersItem, ProvidersList } from '../providers';

const DexExchangesProviders = () => {
  const t = useI18nContext();
  const history = useHistory();
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const list = useSelector(getSwapDEXProviders);
  const { loading } = useSelector(getSwapDEX);

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
        message,
        minAmount,
        fromAmount,
      } = provider;
      if ((error || message) && fromAmount >= minAmount) {
        // TODO: create toast hooks
        toast.error(`[${name}] ${error || message}`);
        return;
      }
      history.push(`${VIEW_DEX_ROUTE}/${providerName}`);
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

export default memo(DexExchangesProviders);
