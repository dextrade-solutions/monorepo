import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo } from 'react';
import Preloader from '../../../../components/ui/icon/preloader';

const ProvidersCard = ({
  children,
  onClick,
  disabled = false,
  error = '',
  loading = false,
}) => {
  const handleClick = useCallback(
    (e) => {
      e?.stopPropagation();
      e?.nativeEvent?.stopImmediatePropagation();

      if (disabled) {
        return;
      }

      onClick && onClick(e);
    },
    [onClick, disabled],
  );

  const renderChildren = useMemo(() => children, [children]);

  return (
    <div
      className={classnames('exchanges-providers__card', {
        'exchanges-providers__card--error': Boolean(error),
        'exchanges-providers__card--disabled': disabled,
      })}
      onClick={handleClick}
    >
      {renderChildren}
    </div>
  );
};

ProvidersCard.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

export default memo(ProvidersCard);
