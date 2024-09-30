import React from 'react';
import PropTypes from 'prop-types';

const TokenBadge = ({ value }) => {
  return (
    <div className="token-badge">
      <span className="token-badge__badge">{value}</span>
    </div>
  );
};

TokenBadge.propTypes = {
  value: PropTypes.string.isRequired,
};

export default TokenBadge;
