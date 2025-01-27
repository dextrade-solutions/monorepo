import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useState, useCallback, useRef, useEffect } from 'react';

import { SelectCoinsItemLabel } from './select-coins-item-label';
import { useGlobalModalContext } from '../../app/modals';

export const SelectCoinsItem = memo(
  ({
    asset,
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
    const t = (v) => v;
    const { showModal } = useGlobalModalContext();
    const inputRef = useRef(null);
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
      showModal({
        name: 'ASSET_SELECT',
        value: asset,
        items,
        onChange,
        loading,
        fuseSearchKeys,
        maxListItem,
        shouldSearchForImports,
        searchPlaceholder,
      });
    }, []);
    return (
      <div className={classnames('select-coins__item', className)} tabIndex="0">
        <SelectCoinsItemLabel
          coin={asset}
          reversed={reversed}
          placeholder={placeholder || t('coin')}
          onClick={onToggle}
        />
      </div>
    );
  },
);

SelectCoinsItem.propTypes = {
  asset: PropTypes.object,
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
