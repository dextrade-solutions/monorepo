import PropTypes from 'prop-types';
import React, { memo } from 'react';

const ProvidersItemRow = ({ side, children }) => {
  return (
    <div className="exchanges-providers__item-row">
      <div className="exchanges-providers__item-row__side">{side}</div>
      <div className="exchanges-providers__item-row__content">{children}</div>
    </div>
  );
};

ProvidersItemRow.propTypes = {
  side: PropTypes.node,
  children: PropTypes.node,
};

export default memo(ProvidersItemRow);
