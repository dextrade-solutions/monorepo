import React from 'react';

const formatSrcValue = (value: any) => {
  if (typeof value === 'object') {
    return value;
  } else if (typeof value === 'string' && value.includes('-')) {
    return `https://api.dextrade.com/public/image/${value}`;
  }
  return `data:image/jpeg;base64,${value}`;
};

const Image = ({ src }: { src: any }) => {
  return (
    <img
      className="image"
      style={{ backgroundImage: `url(${formatSrcValue(src)})` }}
    />
  );
};

export default Image;
