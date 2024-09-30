import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
// eslint-disable-next-line import/named
import { COIN_DEFAULT } from '../../../../shared/constants/tokens';
import IconWithFallback from '../icon-with-fallback';

const ICON_URL_DEFAULT = './images/coins/default.svg';

export default function UrlIcon({
  url,
  size,
  className,
  name,
  fallbackClassName,
}) {
  return (
    <IconWithFallback
      className={classnames('url-icon', className)}
      icon={url || ICON_URL_DEFAULT || COIN_DEFAULT}
      size={size}
      name={name}
      fallbackClassName={classnames('url-icon__fallback', fallbackClassName)}
    />
  );
}

UrlIcon.propTypes = {
  url: PropTypes.string,
  className: PropTypes.string,
  name: PropTypes.string,
  fallbackClassName: PropTypes.string,
  size: PropTypes.number,
};
