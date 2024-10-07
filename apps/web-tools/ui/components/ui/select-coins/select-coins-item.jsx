import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useState, useCallback, useRef, useEffect } from 'react';

import { SelectCoinsItemDropdown } from './select-coins-item-dropdown';
import { SelectCoinsItemDropdownCollapse } from './select-coins-item-dropdown-collapse';
import { SelectCoinsItemLabel } from './select-coins-item-label';
import { useI18nContext } from '../../../hooks/useI18nContext';

export const SelectCoinsItem = memo(
  ({
    coin,
    onChange,
    reversed,
    className,
    placeholder,
    searchPlaceholder,
    items = [],
    loading = false,
    maxListItem,
    fuseSearchKeys,
    shouldSearchForImports,
  }) => {
    const inputRef = useRef(null);
    const t = useI18nContext();
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (open) {
        inputRef.current.focus();
      }
    }, [open]);

    const onClose = useCallback(() => {
      setOpen(false);
    }, []);

    const onToggle = useCallback(() => {
      setOpen(!open);
    }, [open]);
    return (
      <div className={classnames('select-coins__item', className)} tabIndex="0">
        <SelectCoinsItemLabel
          coin={coin}
          reversed={reversed}
          placeholder={placeholder || t('coin')}
          onClick={onToggle}
        />
        <SelectCoinsItemDropdownCollapse
          isOpen={open}
          onClose={onClose}
          reversed={reversed}
        >
          <SelectCoinsItemDropdown
            inputRef={inputRef}
            placeholderInput={
              searchPlaceholder || t('Search name or contract address')
            }
            onClose={onClose}
            onChange={onChange}
            coin={coin}
            items={items}
            loading={loading}
            showRateLabel={!reversed}
            maxListItem={maxListItem}
            fuseSearchKeys={fuseSearchKeys}
            shouldSearchForImports={shouldSearchForImports}
          />
        </SelectCoinsItemDropdownCollapse>
      </div>
    );
  },
);

SelectCoinsItem.propTypes = {
  coin: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  reversed: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  maxListItem: PropTypes.number,
  loading: PropTypes.bool,
  fuseSearchKeys: PropTypes.object,
  shouldSearchForImports: PropTypes.bool,
};
