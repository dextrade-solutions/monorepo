import React, { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  ASSET_ROUTE,
  IMPORT_TOKEN_ROUTE,
} from '../../helpers/constants/routes';
import Button from '../../components/ui/button';
import Identicon from '../../components/ui/identicon';
import { I18nContext } from '../../contexts/i18n';
import { MetaMetricsContext } from '../../contexts/metametrics';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import { getPendingTokens } from '../../ducks/metamask/metamask';
import { addTokens, clearPendingTokens } from '../../store/actions';
import { EVENT, EVENT_NAMES } from '../../../shared/constants/metametrics';
import {
  AssetType,
  TokenStandard,
} from '../../../shared/constants/transaction';
import UserPreferencedCurrencyDisplay from '../../components/app/user-preferenced-currency-display/user-preferenced-currency-display.component';
import { PRIMARY } from '../../helpers/constants/common';

const getTokenName = (name, symbol) => {
  return name === undefined ? symbol : `${name} (${symbol})`;
};

const ConfirmImportToken = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEvent = useContext(MetaMetricsContext);

  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const pendingTokens = useSelector(getPendingTokens);

  const handleAddTokens = useCallback(async () => {
    await dispatch(addTokens(pendingTokens.map((token) => token.getToken())));

    const addedTokenValues = pendingTokens;
    const firstTokenAddress = addedTokenValues?.[0].address?.toLowerCase();

    addedTokenValues.forEach((pendingToken) => {
      trackEvent({
        event: EVENT_NAMES.TOKEN_ADDED,
        category: EVENT.CATEGORIES.WALLET,
        sensitiveProperties: {
          token_symbol: pendingToken.symbol,
          token_contract_address: pendingToken.address,
          token_decimal_precision: pendingToken.decimals,
          unlisted: pendingToken.unlisted,
          source: pendingToken.isCustom
            ? EVENT.SOURCE.TOKEN.CUSTOM
            : EVENT.SOURCE.TOKEN.LIST,
          token_standard: TokenStandard.ERC20,
          asset_type: AssetType.token,
        },
      });
    });

    dispatch(clearPendingTokens());

    if (firstTokenAddress) {
      history.push(`${ASSET_ROUTE}/${firstTokenAddress}`);
    } else {
      history.push(mostRecentOverviewPage);
    }
  }, [dispatch, history, mostRecentOverviewPage, pendingTokens, trackEvent]);

  useEffect(() => {
    if (pendingTokens.length === 0) {
      history.push(mostRecentOverviewPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-container">
      <div className="page-container__header">
        <div className="page-container__title">
          {t('importTokensCamelCase')}
        </div>
        <div className="page-container__subtitle">
          {t('likeToImportTokens')}
        </div>
      </div>
      <div className="page-container__content">
        <div className="confirm-import-token">
          <div className="confirm-import-token__header">
            <div className="confirm-import-token__token">{t('token')}</div>
            <div className="confirm-import-token__balance">{t('balance')}</div>
          </div>
          <div className="confirm-import-token__token-list">
            {pendingTokens.map((token) => {
              const { localId, name, symbol, balance, decimals } = token;

              return (
                <div
                  className="confirm-import-token__token-list-item"
                  key={localId}
                >
                  <div className="confirm-import-token__token confirm-import-token__data">
                    <Identicon
                      className="confirm-import-token__token-icon"
                      diameter={48}
                      image={token.getIconUrl()}
                      address={localId}
                    />
                    <div className="confirm-import-token__name">
                      {getTokenName(name, symbol)}
                    </div>
                  </div>
                  {balance && (
                    <div className="confirm-import-token__balance">
                      <UserPreferencedCurrencyDisplay
                        type={PRIMARY}
                        value={balance}
                        ticker={symbol}
                        shiftBy={decimals}
                        isDecimal
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="page-container__footer">
        <footer>
          <Button
            type="secondary"
            large
            className="page-container__footer-button"
            onClick={() => {
              dispatch(clearPendingTokens());
              history.push(IMPORT_TOKEN_ROUTE);
            }}
          >
            {t('back')}
          </Button>
          <Button
            type="primary"
            large
            className="page-container__footer-button"
            onClick={handleAddTokens}
          >
            {t('importTokensCamelCase')}
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmImportToken;
