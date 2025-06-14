import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ActionableMessage from '../../components/ui/actionable-message/actionable-message';
import Button from '../../components/ui/button';
import Identicon from '../../components/ui/identicon';
import { PageContainerFooter } from '../../components/ui/page-container';
import { I18nContext } from '../../contexts/i18n';
import { MetaMetricsContext } from '../../contexts/metametrics';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import { getTokens } from '../../ducks/metamask/metamask';
import ZENDESK_URLS from '../../helpers/constants/zendesk-url';
import { isEqualCaseInsensitive } from '../../../shared/modules/string-utils';
import { assetModel, getSuggestedAssets } from '../../selectors';
import { rejectWatchAsset, acceptWatchAsset } from '../../store/actions';
import { EVENT, EVENT_NAMES } from '../../../shared/constants/metametrics';
import {
  AssetType,
  TokenStandard,
} from '../../../shared/constants/transaction';
import UserPreferencedCurrencyDisplay from '../../components/app/user-preferenced-currency-display/user-preferenced-currency-display.component';
import { PRIMARY } from '../../helpers/constants/common';

function getTokenName(name, symbol) {
  return name === undefined ? symbol : `${name} (${symbol})`;
}

/**
 * @param {Array} suggestedAssets - an array of assets suggested to add to the user's wallet
 * via the RPC method `wallet_watchAsset`
 * @param {Array} tokens - the list of tokens currently tracked in state
 * @returns {boolean} Returns true when the list of suggestedAssets contains an entry with
 *          an address that matches an existing token.
 */
function hasDuplicateAddress(suggestedAssets, tokens) {
  const duplicate = suggestedAssets.find(({ asset }) => {
    const dupe = tokens.find(({ localId }) => {
      return isEqualCaseInsensitive(localId, asset.localId);
    });
    return Boolean(dupe);
  });
  return Boolean(duplicate);
}

/**
 * @param {Array} suggestedAssets - a list of assets suggested to add to the user's wallet
 * via RPC method `wallet_watchAsset`
 * @param {Array} tokens - the list of tokens currently tracked in state
 * @returns {boolean} Returns true when the list of suggestedAssets contains an entry with both
 *          1. a symbol that matches an existing token
 *          2. an address that does not match an existing token
 */
function hasDuplicateSymbolAndDiffAddress(suggestedAssets, tokens) {
  const duplicate = suggestedAssets.find(({ asset }) => {
    const dupe = tokens.find((token) => {
      return (
        isEqualCaseInsensitive(token.symbol, asset.symbol) &&
        !isEqualCaseInsensitive(token.localId, asset.localId)
      );
    });
    return Boolean(dupe);
  });
  return Boolean(duplicate);
}

const ConfirmAddSuggestedToken = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();

  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const suggestedAssets = useSelector(getSuggestedAssets);
  const tokens = useSelector(getTokens);

  const suggestedAssetModels = useSelector((state) =>
    suggestedAssets.map(({ asset }) => assetModel(state, asset)),
  );

  const trackEvent = useContext(MetaMetricsContext);

  const knownTokenActionableMessage = useMemo(() => {
    return (
      hasDuplicateAddress(suggestedAssets, tokens) && (
        <ActionableMessage
          message={t('knownTokenWarning', [
            <Button
              type="link"
              key="confirm-add-suggested-token-duplicate-warning"
              className="confirm-add-suggested-token__link"
              rel="noopener noreferrer"
              target="_blank"
              href={ZENDESK_URLS.TOKEN_SAFETY_PRACTICES}
            >
              {t('learnScamRisk')}
            </Button>,
          ])}
          type="warning"
          withRightButton
          useIcon
          iconFillColor="#f8c000"
        />
      )
    );
  }, [suggestedAssets, tokens, t]);

  const reusedTokenNameActionableMessage = useMemo(() => {
    return (
      hasDuplicateSymbolAndDiffAddress(suggestedAssets, tokens) && (
        <ActionableMessage
          message={t('reusedTokenNameWarning')}
          type="warning"
          withRightButton
          useIcon
          iconFillColor="#f8c000"
        />
      )
    );
  }, [suggestedAssets, tokens, t]);

  const handleAddTokensClick = useCallback(async () => {
    await Promise.all(
      suggestedAssets.map(async ({ asset, id }) => {
        await dispatch(acceptWatchAsset(id));

        trackEvent({
          event: EVENT_NAMES.TOKEN_ADDED,
          category: EVENT.CATEGORIES.WALLET,
          sensitiveProperties: {
            token_symbol: asset.symbol,
            token_contract_address: asset.address,
            token_decimal_precision: asset.decimals,
            unlisted: asset.unlisted,
            source: EVENT.SOURCE.TOKEN.DAPP,
            token_standard: TokenStandard.ERC20,
            asset_type: AssetType.token,
          },
        });
      }),
    );

    history.push(mostRecentOverviewPage);
  }, [dispatch, history, trackEvent, mostRecentOverviewPage, suggestedAssets]);

  const goBackIfNoSuggestedAssetsOnFirstRender = () => {
    if (!suggestedAssets.length) {
      history.push(mostRecentOverviewPage);
    }
  };

  useEffect(() => {
    goBackIfNoSuggestedAssetsOnFirstRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-container">
      <div className="page-container__header">
        <div className="page-container__title">{t('addSuggestedTokens')}</div>
        <div className="page-container__subtitle">
          {t('likeToImportTokens')}
        </div>
        {knownTokenActionableMessage}
        {reusedTokenNameActionableMessage}
      </div>
      <div className="page-container__content">
        <div className="confirm-add-suggested-token">
          <div className="confirm-add-suggested-token__header">
            <div className="confirm-add-suggested-token__token">
              {t('token')}
            </div>
            <div className="confirm-add-suggested-token__balance">
              {t('balance')}
            </div>
          </div>
          <div className="confirm-add-suggested-token__token-list">
            {suggestedAssetModels.map((asset) => {
              return (
                <div
                  className="confirm-add-suggested-token__token-list-item"
                  key={asset.localId}
                >
                  <div className="confirm-add-suggested-token__token confirm-add-suggested-token__data">
                    <Identicon
                      className="confirm-add-suggested-token__token-icon"
                      diameter={48}
                      address={asset.localId}
                      image={asset.getIconUrl()}
                    />
                    <div className="confirm-add-suggested-token__name">
                      {getTokenName(asset.name, asset.symbol)}
                    </div>
                  </div>
                  <div className="confirm-add-suggested-token__balance">
                    {asset.balance && (
                      <div className="confirm-import-token__balance">
                        <UserPreferencedCurrencyDisplay
                          type={PRIMARY}
                          value={asset.balance}
                          ticker={asset.symbol}
                          shiftBy={asset.decimals}
                          isDecimal
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <PageContainerFooter
        cancelText={t('cancel')}
        submitText={t('addToken')}
        onCancel={async () => {
          await Promise.all(
            suggestedAssets.map(({ id }) => dispatch(rejectWatchAsset(id))),
          );
          history.push(mostRecentOverviewPage);
        }}
        onSubmit={handleAddTokensClick}
        disabled={suggestedAssets.length === 0}
      />
    </div>
  );
};

export default ConfirmAddSuggestedToken;
