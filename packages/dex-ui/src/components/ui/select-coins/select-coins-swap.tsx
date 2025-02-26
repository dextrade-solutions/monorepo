import { Box, Fab, Tooltip } from '@mui/material';
import classnames from 'classnames';
import { Icon, UrlIcon } from 'dex-ui';
import { ArrowUpDown } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { memo, useState, useCallback } from 'react';

// TODO: refactor to IconButton or ButtonIcon or Icon without mask-image styles
const ICON_VERTICAL = 'swap-vertical';
const ICON_HORIZONTAL = 'swap-horizontal';

interface SelectCoinsSwapProps {
  onClick?: () => void;
  disabled?: boolean;
  vertical?: boolean;
}

export const SelectCoinsSwap = memo<SelectCoinsSwapProps>(
  ({ onClick, vertical, disabled, ...rest }) => {
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
        text={t('swapSwapSwitch')}
        position="top"
        arrow
        disabled={disabled}
      >
        <Fab
          className={classnames('select-coins__swap', {
            'select-coins__swap-clicked': clicked,
            'select-coins__swap-disabled': disabled,
          })}
          sx={{
            boxShadow: 'none',
          }}
          size="small"
          color="tertiary"
          disableTouchRipple
          tabIndex={1}
          onClick={handleClick}
          {...rest}
        >
          {/* <ArrowUpDown /> */}
          <Icon
            name={vertical ? ICON_VERTICAL : ICON_HORIZONTAL}
            color="primary"
            className="select-coins__swap__icon"
          />
        </Fab>
      </Tooltip>
    );
  },
);
