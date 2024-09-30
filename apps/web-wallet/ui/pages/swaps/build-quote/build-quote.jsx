import React from 'react';
import PropTypes from 'prop-types';
import ExchangesTabs from './exchanges-tabs';

export default function BuildQuote(props) {
  return (
    <div className="build-quote">
      <div className="build-quote__content">
        <ExchangesTabs {...props} />
      </div>
    </div>
  );
}

BuildQuote.propTypes = {
  ethBalance: PropTypes.string,
  shuffledTokensList: PropTypes.array,
};
