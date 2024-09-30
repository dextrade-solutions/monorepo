import PropTypes from 'prop-types';
import React, { memo } from 'react';

const ProvidersItemError = ({
  error = '',
  disabled = false,
  loading = false,
}) => {
  if (disabled || loading || !error) {
    return null;
  }

  return (
    <div className="exchanges-providers__item-error">
      <div className="exchanges-providers__item-error__message">{error}</div>
    </div>
  );
};

ProvidersItemError.propTypes = {
  error: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default memo(ProvidersItemError);
