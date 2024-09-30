import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import { useI18nContext } from '../../../hooks/useI18nContext';

import UrlIcon from '../../../components/ui/url-icon';
import SearchableItemList from '../../swaps/searchable-item-list';

import Box from '../../../components/ui/box/box';
import {
  DISPLAY,
  TextColor,
  TextVariant,
  FLEX_DIRECTION,
} from '../../../helpers/constants/design-system';
import { Text } from '../../../components/component-library';

export default function DropdownTokens({
  className = '',
  itemsToSearch,
  selectedItem,
  searchPlaceholderText,
  fuseSearchKeys,
  hideRightLabels,
  onSelect,
}) {
  const t = useI18nContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onClickSelector = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    }
  }, [isOpen]);

  const onKeyUp = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      onClickSelector(e);
    }
  };

  const onClickItem = useCallback(
    (v) => {
      onSelect?.(v);
      setIsOpen(false);
    },
    [onSelect],
  );

  return (
    <>
      <div
        className={classnames(
          'dropdown-tokens-pair__selector-closed-container',
          className,
        )}
        onKeyUp={onKeyUp}
        tabIndex="0"
      >
        <div
          className="dropdown-tokens-pair__selector-closed"
          onClick={onClickSelector}
        >
          {selectedItem && (
            <UrlIcon
              url={selectedItem?.getIconUrl()}
              className="dropdown-tokens-pair__selector-closed-icon"
              name={selectedItem?.symbol}
            />
          )}
          <div className="dropdown-tokens-pair__labels">
            <div className="dropdown-tokens-pair__item-labels">
              <span
                className={classnames(
                  'dropdown-tokens-pair__closed-primary-label',
                  {
                    'dropdown-tokens-pair__select-default': !selectedItem,
                  },
                )}
              >
                {selectedItem?.symbol && (
                  <Text
                    variant={TextVariant.bodyXs}
                    color={TextColor.textMuted}
                  >
                    {searchPlaceholderText}
                  </Text>
                )}
                <Box
                  display={DISPLAY.FLEX}
                  flexDirection={FLEX_DIRECTION.COLUMN}
                >
                  <Text variant={TextVariant.bodyLgMedium}>
                    {selectedItem?.symbol || searchPlaceholderText}
                  </Text>
                  {selectedItem?.standard && (
                    <Text className="network-type-label">
                      {selectedItem.standard}
                    </Text>
                  )}
                </Box>
              </span>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="dropdown-tokens-pair__searchable-item-list">
            <SearchableItemList
              theme="material-white-padded"
              className="dropdown-tokens-pair__list--full-width"
              itemsToSearch={itemsToSearch}
              Placeholder={() => (
                <div className="dropdown-search-list__placeholder">
                  {t('swapBuildQuotePlaceHolderText', [searchQuery])}
                </div>
              )}
              searchPlaceholderText={
                searchPlaceholderText || t('swapSearchNameOrAddress')
              }
              fuseSearchKeys={fuseSearchKeys}
              listContainerClassName="build-quote__open-dropdown"
              hideRightLabels={hideRightLabels}
              defaultToAll
              shouldSearchForImports
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onClickItem={onClickItem}
              maxListItems={30}
              isAssetsList
            />
            <div
              className="dropdown-search-list__close-area"
              onClick={() => {
                setIsOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

DropdownTokens.propTypes = {
  itemsToSearch: PropTypes.array,
  fuseSearchKeys: PropTypes.array,
  selectedItem: PropTypes.object,
  searchPlaceholderText: PropTypes.string,
  className: PropTypes.string,
  hideRightLabels: PropTypes.bool,
  onSelect: PropTypes.func,
};
