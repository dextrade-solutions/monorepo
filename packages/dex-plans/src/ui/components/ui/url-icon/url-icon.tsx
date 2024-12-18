import classnames from 'classnames';

import IconWithFallback from '../icon-with-fallback';
import './index.scss';

const ICON_URL_DEFAULT = './images/coins/default.svg';

export default function UrlIcon({
  url,
  size,
  className,
  name,
  fallbackClassName,
}: {
  url: string;
  size?: number;
  className?: string;
  name?: string;
  fallbackClassName?: string;
}) {
  return (
    <IconWithFallback
      className={classnames('url-icon', className)}
      icon={url || ICON_URL_DEFAULT}
      name={name}
      size={size}
      fallbackClassName={classnames('url-icon__fallback', fallbackClassName)}
    />
  );
}
