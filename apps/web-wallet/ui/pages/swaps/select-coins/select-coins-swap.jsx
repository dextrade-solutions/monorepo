import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useState, useMemo, useCallback } from 'react';
import Tooltip from '../../../components/ui/tooltip';
import UrlIcon from '../../../components/ui/url-icon';
import { useI18nContext } from '../../../hooks/useI18nContext';

// TODO: refactor to IconButton or ButtonIcon or Icon without mask-image styles
const ICON_URL = './images/icons/swap-circle-arrow.svg';

export const SelectCoinsSwap = memo(
  ({ onClick, disabled, itemsFrom, itemsTo, coinFrom, coinTo }) => {
    const t = useI18nContext();
    const [clicked, setClicked] = useState(false);

    const isDisabled = useMemo(
      () =>
        disabled ||
        (!coinFrom && !coinTo) ||
        (coinTo && !itemsFrom.find((item) => item?.uid === coinTo?.uid)),
      [disabled, coinFrom, coinTo, itemsFrom],
    );

    const handleClick = useCallback(
      (e) => {
        e && e.preventDefault();
        if (isDisabled) {
          return;
        }
        setClicked(!clicked);
        onClick && onClick();
      },
      [onClick, clicked, isDisabled],
    );

    return (
      <Tooltip
        title={t('swapSwapSwitch')}
        position="top"
        arrow
        disabled={isDisabled}
      >
        <div
          className={classnames('select-coins__swap', {
            'select-coins__swap-clicked': clicked,
            'select-coins__swap-disabled': isDisabled,
          })}
          tabIndex={1}
          onClick={handleClick}
        >
          <UrlIcon
            url={ICON_URL}
            className="select-coins__swap__icon"
            name={t('swapSwapSwitch')}
          />
        </div>
      </Tooltip>
    );
  },
);

SelectCoinsSwap.propTypes = {
  coinFrom: PropTypes.object,
  coinTo: PropTypes.object,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  itemsFrom: PropTypes.arrayOf(PropTypes.object),
  itemsTo: PropTypes.arrayOf(PropTypes.object),
};
