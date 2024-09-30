import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export default function LoadingSkeleton({ isLoading, children }) {
  return (
    <div
      className={classnames('loading-skeleton', {
        'loading-skeleton--loading': isLoading,
      })}
    >
      {children}
      <span
        className={classnames('loading-skeleton__loader', {
          'loading-skeleton__loader--show': isLoading,
        })}
      />
    </div>
  );
}

LoadingSkeleton.propTypes = {
  isLoading: PropTypes.bool,
  children: PropTypes.node,
};
