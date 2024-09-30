import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Breakpoints } from '../../../../constants/breakpoints';
import { IconColor, Size } from '../../../../helpers/constants/design-system';
import { useWindowSize } from '../../../../hooks/useWindowSize';
import Tooltip from '../../../ui/tooltip';
import { Icon } from '../../../component-library';

export const MultisigListItemAction = ({
  disabled = false,
  iconName,
  onClick,
  title,
}) => {
  const { width } = useWindowSize();
  const Component = useMemo(
    () => (width <= Breakpoints.SM ? Icon : Icon),
    [width],
  );

  const handleClick = useCallback(
    (e) => {
      e && e.stopPropagation();
      onClick && onClick(e);
    },
    [onClick],
  );

  return (
    <>
      <Component
        name={iconName}
        size={Size.LG}
        color={IconColor.primaryDefault}
        type="inline"
        onClick={handleClick}
        disabled={disabled}
      >
        {title}
      </Component>
      {/*<Tooltip position="top" title={title}>*/}
      {/*  <Component*/}
      {/*    name={iconName}*/}
      {/*    size={Size.LG}*/}
      {/*    color={IconColor.primaryDefault}*/}
      {/*    type="inline"*/}
      {/*    onClick={handleClick}*/}
      {/*    disabled={disabled}*/}
      {/*  >*/}
      {/*    {title}*/}
      {/*  </Component>*/}
      {/*</Tooltip>*/}
    </>
  );
};

MultisigListItemAction.propTypes = {
  iconName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
