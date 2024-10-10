import { Tooltip } from '@mui/material';
import classnames from 'classnames';
import { UrlIcon } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { memo, useState, useCallback } from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

// TODO: refactor to IconButton or ButtonIcon or Icon without mask-image styles
const ICON_URL = './images/icons/swap-circle-arrow.svg';

export const SelectCoinsSwap = memo(({ onClick, disabled }) => {
  const t = useI18nContext();
  const [clicked, setClicked] = useState(false);

  const handleClick = useCallback(
    (e) => {
      e && e.preventDefault();
      setClicked(!clicked);
      onClick && onClick();
    },
    [onClick, clicked],
  );

  return (
    <Tooltip
      text={t('swapSwapSwitch')}
      position="top"
      arrow
      disabled={disabled}
    >
      <div
        className={classnames('select-coins__swap', {
          'select-coins__swap-clicked': clicked,
          'select-coins__swap-disabled': disabled,
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
});

SelectCoinsSwap.propTypes = {
  coinFrom: PropTypes.object,
  coinTo: PropTypes.object,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};
