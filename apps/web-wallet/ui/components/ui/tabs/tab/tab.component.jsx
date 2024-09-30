import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Tab = (props) => {
  const {
    activeClassName,
    className,
    'data-testid': dataTestId,
    isActive,
    name,
    onClick,
    tabIndex,
    tabKey,
    isLoading,
    disabled,
  } = props;

  const ref = useRef();

  const isDisabled = isLoading || disabled;

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (isDisabled) {
        return;
      }
      onClick && onClick(tabIndex);
    },
    [isDisabled, onClick, tabIndex],
  );

  return (
    <li
      ref={ref}
      className={classnames('tab', className, {
        'tab--active': isActive,
        'tab--disabled': isDisabled,
        [activeClassName]: activeClassName && isActive,
      })}
      data-testid={dataTestId}
      onClick={handleClick}
      key={tabKey}
    >
      <button disabled={isLoading}>{name}</button>
    </li>
  );
};

Tab.propTypes = {
  activeClassName: PropTypes.string,
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  isActive: PropTypes.bool, // required, but added using React.cloneElement
  name: PropTypes.string.isRequired,
  tabKey: PropTypes.string.isRequired, // for Tabs selection purpose
  onClick: PropTypes.func,
  tabIndex: PropTypes.number, // required, but added using React.cloneElement
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

Tab.defaultProps = {
  activeClassName: undefined,
  className: undefined,
  onClick: undefined,
  isLoading: false,
  disabled: false,
};

export default Tab;
