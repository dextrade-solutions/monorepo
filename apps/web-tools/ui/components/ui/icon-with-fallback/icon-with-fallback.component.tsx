import { useState } from 'react';
import classnames from 'classnames';
import { Box } from '@mui/material';

const IconWithFallback = ({
  name = '',
  icon = null,
  size,
  className,
  fallbackClassName,
  wrapperClassName,
  ...props
}: {
  name: string;
  icon?: string | null;
  size: number;
  className?: string;
  fallbackClassName?: string;
  wrapperClassName?: string;
}) => {
  const [iconError, setIconError] = useState(false);
  const style = size ? { height: `${size}px`, width: `${size}px` } : {};

  const handleOnError = () => {
    setIconError(true);
  };

  return (
    <Box display="flex" className={classnames(wrapperClassName)}>
      {!iconError && icon ? (
        <img
          onError={handleOnError}
          src={icon}
          style={style}
          className={className}
          alt={name || 'icon'}
          {...props}
        />
      ) : (
        <span
          className={classnames(
            'icon-with-fallback__fallback',
            fallbackClassName,
          )}
        >
          {name?.charAt(0).toUpperCase() || ''}
        </span>
      )}
    </Box>
  );
};

export default IconWithFallback;
