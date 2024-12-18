import './icon.scss';

import { Box } from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Icon = ({
  name,
  size = 'md',
  color = 'inherit',
  className,
  style,
  ...props
}) => {
  return (
    <Box
      className={classnames(className, 'mm-icon', `mm-icon--size-${size}`)}
      as="span"
      display="inline-block"
      color={color}
      style={{
        /**
         * To reduce the possibility of injection attacks
         * the icon component uses mask-image instead of rendering
         * the svg directly.
         */
        maskImage: `url('./images/icons/${name}.svg')`,
        WebkitMaskImage: `url('./images/icons/${name}.svg')`,
        ...style,
      }}
      {...props}
    />
  );
};

Icon.propTypes = {
  /**
   * The name of the icon to display. Should be one of ICON_NAMES
   */
  name: PropTypes.string.isRequired,
  /**
   * The size of the Icon.
   * Possible values could be SIZES.XS (12px), SIZES.SM (16px), SIZES.MD (20px), SIZES.LG (24px), SIZES.XL (32px),
   * Default value is SIZES.MD (20px).
   */
  size: PropTypes.string,
  /**
   * The color of the icon.
   * Defaults to IconColor.inherit.
   */
  color: PropTypes.string,
  /**
   * An additional className to apply to the icon.
   */
  className: PropTypes.string,
  /**
   * Addition style properties to apply to the icon.
   * The Icon component uses inline styles to apply the icon's mask-image so be wary of overriding
   */
  style: PropTypes.object,
  /**
   * Icon accepts all the props from Box
   */
  ...Box.propTypes,
};

export default Icon;
