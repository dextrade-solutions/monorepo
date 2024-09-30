import PropTypes from 'prop-types';
import React, { memo, useCallback, isValidElement, Children } from 'react';

const ProvidersList = (props) => {
  const { list, getItemKey = null, children } = props;

  const renderChildren = useCallback(
    (provider) => {
      if (!children) {
        return <></>;
      }

      // eslint-disable-next-line no-unused-vars
      const { children: c, getItemKey: gik, ...restProps } = props;
      const childrenProps = { ...restProps, provider };
      if (getItemKey) {
        childrenProps.key = getItemKey(provider);
      }

      if (typeof children === 'function') {
        return children(childrenProps);
      }

      return Children.map(children, (child) => {
        if (isValidElement(child)) {
          return React.cloneElement(child, childrenProps);
        }
        return child;
      });
    },
    [children, props, getItemKey],
  );

  return (
    <div className="exchanges-providers">
      <ul className="exchanges-providers__list">
        {list.map((item, index) => (
          <li
            className="exchanges-providers__list__item"
            key={getItemKey ? getItemKey(item) : item.id || item.name || index}
          >
            {renderChildren(item)}
          </li>
        ))}
      </ul>
    </div>
  );
};

ProvidersList.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      error: PropTypes.string,
      message: PropTypes.string,
      minAmount: PropTypes.number,
      toAmount: PropTypes.number,
      rate: PropTypes.number,
    }),
  ),
  getItemKey: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};

export default memo(ProvidersList);
