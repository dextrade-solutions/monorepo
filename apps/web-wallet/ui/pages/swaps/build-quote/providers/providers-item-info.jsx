import PropTypes from 'prop-types';
import React, { memo } from 'react';
import UrlIcon from '../../../../components/ui/url-icon';
import { getProviderImageUrl } from './helpers';

const ProvidersItemInfo = ({ image, name, children }) => {
  return (
    <div className="exchanges-providers__item-info">
      <UrlIcon
        url={getProviderImageUrl(image)}
        className="exchanges-providers__item-info__icon"
        name={name}
      />
      <div className="exchanges-providers__item-info__name">{name}</div>
      {children}
    </div>
  );
};

ProvidersItemInfo.propTypes = {
  image: PropTypes.string,
  name: PropTypes.string,
  children: PropTypes.node,
};

export default memo(ProvidersItemInfo);
