import React from 'react';
import classnames from 'classnames';

import IconWithFallback from '../icon-with-fallback';
import './index.scss';

const ICON_URL_DEFAULT = '/images/coins/default.svg';

export default function UrlIcon({
  url,
  size,
  className,
  name,
  fallbackClassName,
  borderRadius = '50%',
  ...props
}: {
  url: string;
  size?: number;
  className?: string;
  name?: string;
  borderRadius?: string;
  fallbackClassName?: string;
}) {
  return (
    <IconWithFallback
      className={classnames('url-icon', className)}
      icon={url || ICON_URL_DEFAULT}
      name={name}
      size={size}
      borderRadius={borderRadius}
      fallbackClassName={classnames('url-icon__fallback', fallbackClassName)}
      {...props}
    />
  );
}
