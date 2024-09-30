import PropTypes from 'prop-types';
import React from 'react';

const formatSrcValue = (value) => {
  if (typeof value === 'object') {
    return value;
  } else if (typeof value === 'string' && value.includes('-')) {
    return `https://api.dextrade.com/public/image/${value}`;
  }
  return `data:image/jpeg;base64,${value}`;
};

const Image = ({ src }) => {
  return (
    <img
      className="image"
      style={{ backgroundImage: `url(${formatSrcValue(src)})` }}
    />
  );
};

Image.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default Image;
