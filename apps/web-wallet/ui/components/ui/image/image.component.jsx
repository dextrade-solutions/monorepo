import React from 'react';
import PropTypes from 'prop-types';
import { DEXTRADE_BASE_URL } from '../../../helpers/constants/common';

const formatSrcValue = (value) => {
  if (typeof value === 'object') {
    return value;
  } else if (typeof value === 'string' && value.includes('-')) {
    return `${DEXTRADE_BASE_URL}/public/image/${value}`;
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
