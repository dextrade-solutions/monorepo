import { Fab, Tooltip, CircularProgress } from '@mui/material';
import classnames from 'classnames';
import { Icon } from 'dex-ui';
import React, { memo, useState, useCallback } from 'react';

// TODO: refactor to IconButton or ButtonIcon or Icon without mask-image styles
const ICON_VERTICAL = 'swap-vertical';
const ICON_HORIZONTAL = 'swap-horizontal';

interface SelectCoinsSwapProps {
  onClick?: () => void;
  disabled?: boolean;
  vertical?: boolean;
  loading?: boolean; // Add loading prop
}

export const SelectCoinsSwap = memo<SelectCoinsSwapProps>(
  ({ onClick, vertical, disabled, loading, ...rest }) => {
    const t = (v) => v;
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
        title={t('swapSwapSwitch')}
        placement="top"
        arrow
        disableInteractive={disabled}
      >
        <Fab
          className={classnames('select-coins__swap', {
            'select-coins__swap-clicked': clicked,
            'select-coins__swap-disabled': disabled,
            'select-coins__swap-loading': loading, // Add loading class
          })}
          sx={{
            boxShadow: 'none',
          }}
          size="small"
          color="tertiary"
          disableTouchRipple
          tabIndex={1}
          onClick={loading ? undefined : handleClick} // Disable onClick when loading
          disabled={disabled || loading} // Disable Fab when loading
          {...rest}
        >
          {loading ? (
            <CircularProgress color="tertiary" size={20} /> // Show spinner when loading
          ) : (
            <Icon
              name={vertical ? ICON_VERTICAL : ICON_HORIZONTAL}
              color="primary"
              className="select-coins__swap__icon"
            />
          )}
        </Fab>
      </Tooltip>
    );
  },
);
