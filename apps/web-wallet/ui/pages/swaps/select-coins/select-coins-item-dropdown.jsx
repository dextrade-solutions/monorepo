import PropTypes from 'prop-types';
import React, { useMemo, useCallback, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { NetworkNames } from '../../../../shared/constants/exchanger';
import { EVENT } from '../../../../shared/constants/metametrics';
import { SWAPS_CHAINID_DEFAULT_BLOCK_EXPLORER_URL_MAP } from '../../../../shared/constants/swaps';
import {
  ButtonIcon,
  ICON_NAMES,
  Text,
} from '../../../components/component-library';
import ActionableMessage from '../../../components/ui/actionable-message';
import Box from '../../../components/ui/box';
import PulseLoader from '../../../components/ui/pulse-loader';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  AlignItems,
  DISPLAY,
  FLEX_DIRECTION,
  JustifyContent,
  Size,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { getURLHostName } from '../../../helpers/utils/util';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  getCurrentChainId,
  getRpcPrefsForCurrentProvider,
} from '../../../selectors';
import { SelectCoinsItemImportToken } from './select-coins-item-import-token';
import { SelectCoinsItemList } from './select-coins-item-list';
import { SelectCoinsItemSearch } from './select-coins-item-search';
import { useCoinInputSearch } from './hooks/useCoinInputSearch';

const Placeholder = ({ loading, searchQuery, shouldSearchForImports }) => {
  const t = useI18nContext();
  const trackEvent = useContext(MetaMetricsContext);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);

  const blockExplorerLink =
    rpcPrefs.blockExplorerUrl ??
    SWAPS_CHAINID_DEFAULT_BLOCK_EXPLORER_URL_MAP[chainId] ??
    null;

  const blockExplorerHostName = getURLHostName(blockExplorerLink);

  const handleClick = useCallback(() => {
    trackEvent({
      event: 'Clicked Block Explorer Link',
      category: EVENT.CATEGORIES.SWAPS,
      properties: {
        link_type: 'Token Tracker',
        action: 'Verify Contract Address',
        block_explorer_domain: blockExplorerHostName,
      },
    });
    global.platform.openTab({
      url: blockExplorerLink,
    });
  }, [trackEvent, blockExplorerHostName, blockExplorerLink]);

  if (loading) {
    return (
      <div className="dropdown-search-list__loading-item">
        <PulseLoader />
        <div className="dropdown-search-list__loading-item-text-container">
          <span className="dropdown-search-list__loading-item-text">
            {t('swapFetchingTokens')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="dropdown-search-list__placeholder">
      {t('swapBuildQuotePlaceHolderText', [searchQuery])}
      {shouldSearchForImports && blockExplorerLink && (
        <div
          tabIndex="0"
          className="searchable-item-list__item searchable-item-list__item--add-token"
          key="searchable-item-list-item-last"
        >
          <ActionableMessage
            message={t('addCustomTokenByContractAddress', [
              <a
                key="dropdown-search-list__etherscan-link"
                onClick={handleClick}
                target="_blank"
                rel="noopener noreferrer"
              >
                {blockExplorerHostName}
              </a>,
            ])}
          />
        </div>
      )}
    </div>
  );
};

export const SelectCoinsItemDropdown = ({
  coin,
  items,
  maxListItem,
  showRateLabel,
  onChange,
  onClose,
  placeholder,
  hideItemIf,
  loading,
  placeholderInput,
  fuseSearchKeys = [
    { name: 'name', weight: 0.499 },
    { name: 'symbol', weight: 0.499 },
    { name: 'address', weight: 0.002 },
  ],
  shouldSearchForImports,
}) => {
  const t = useI18nContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [tokenForImport, setTokenForImport] = useState(null);
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState(false);

  const [searchItems, handleSearchItems] = useCoinInputSearch({
    query: searchQuery,
    list: items,
    fuseSearchKeys,
    shouldSearchForImports,
  });
  const renderList = useMemo(() => {
    const list = searchQuery ? searchItems : items;
    return list
      .slice(0, maxListItem || items.length)
      .filter((item) => Boolean(item))
      .map((item) => {
        const isSelectedFiat = coin?.network === NetworkNames.fiat;
        if (!coin) {
          return item;
        }
        if (isSelectedFiat && item.uid === coin?.uid) {
          return {
            ...item,
            selected: true,
          };
        }
        if (
          !isSelectedFiat &&
          item.network === coin?.network &&
          item.standard === coin?.standard
        ) {
          return {
            ...item,
            selected: true,
          };
        }
        return item;
      })
      .sort(
        (p, n) => Number(n.selected || false) - Number(p.selected || false),
      );
  }, [searchQuery, searchItems, items, maxListItem, coin]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose && onClose();
  }, [onClose]);

  const handleChange = useCallback(
    (c) => {
      setSearchQuery('');
      onChange && onChange(c);
      handleClose();
    },
    [onChange, handleClose],
  );

  const handleChangeSearchValue = useCallback(
    async (value) => {
      setSearchQuery(value.toUpperCase());
      await handleSearchItems(value);
    },
    [handleSearchItems],
  );

  const onImportToken = useCallback((token) => {
    setTokenForImport(token);
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    handleChange(null);
  }, [handleChange]);

  return (
    <div className="select-coins__item__dropdown__inner">
      <Box
        display={DISPLAY.FLEX}
        flexDirection={FLEX_DIRECTION.ROW}
        alignItems={AlignItems.center}
        justifyContent={JustifyContent.spaceBetween}
        paddingLeft={4}
      >
        <Text variant={TextVariant.bodyMdBold}>{t('swapSelectCoin')}</Text>
        <ButtonIcon
          className="select-coins__item__dropdown__header__close"
          iconName={ICON_NAMES.CLOSE}
          size={Size.SM}
          onClick={handleClose}
          ariaLabel={t('close')}
        />
      </Box>
      <SelectCoinsItemImportToken
        isImportTokenModalOpen={isImportTokenModalOpen}
        tokenForImport={tokenForImport}
        setTokenForImport={setTokenForImport}
        searchQuery={searchQuery}
        onSelect={handleChange}
        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
        onClose={handleClose}
      />
      <SelectCoinsItemSearch
        value={searchQuery}
        onChange={handleChangeSearchValue}
        placeholder={placeholderInput}
      />
      <SelectCoinsItemList
        coin={coin}
        list={renderList}
        searchQuery={searchQuery}
        showRateLabel={showRateLabel}
        onChange={handleChange}
        onImportToken={onImportToken}
        onClose={handleClose}
        onReset={handleReset}
        placeholder={
          placeholder || (
            <Placeholder
              loading={loading}
              searchQuery={searchQuery}
              shouldSearchForImports={shouldSearchForImports}
            />
          )
        }
        hideItemIf={hideItemIf}
      />
    </div>
  );
};

Placeholder.propTypes = {
  loading: PropTypes.bool,
  searchQuery: PropTypes.string,
  shouldSearchForImports: PropTypes.bool,
};

SelectCoinsItemDropdown.propTypes = {
  maxListItem: PropTypes.number.isRequired,
  coin: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  showRateLabel: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  hideItemIf: PropTypes.func,
  fuseSearchKeys: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      weight: PropTypes.number.isRequired,
    }),
  ),
  loading: PropTypes.bool,
  placeholder: PropTypes.node,
  placeholderInput: PropTypes.string,
  shouldSearchForImports: PropTypes.bool,
};
