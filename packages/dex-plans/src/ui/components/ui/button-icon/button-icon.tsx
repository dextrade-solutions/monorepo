import { IconButton } from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import './button-icon.scss';

import Icon from '../icon';

export const ButtonIcon = ({
  ariaLabel,
  className,
  color = 'default',
  size = 'md',
  iconName,
  disabled,
  iconProps,
  ...props
}) => {
  return (
    <IconButton
      aria-label={ariaLabel}
      className={classnames(
        'mm-button-icon',
        `mm-button-icon--size-${size}`,
        {
          'mm-button-icon--disabled': disabled,
        },
        className,
      )}
      color={color}
      disabled={disabled}
      {...props}
    >
      <Icon name={iconName} size={size} {...iconProps} />
    </IconButton>
  );
};

ButtonIcon.propTypes = {
  /**
   *  String that adds an accessible name for ButtonIcon
   */
  ariaLabel: PropTypes.string,
  /**
   * The polymorphic `as` prop allows you to change the root HTML element of the Button component between `button` and `a` tag
   */
  as: PropTypes.string,
  /**
   * An additional className to apply to the ButtonIcon.
   */
  className: PropTypes.string,
  /**
   * The color of the ButtonIcon component should use the IconColor object from
   */
  color: PropTypes.string,
  /**
   * Boolean to disable button
   */
  disabled: PropTypes.bool,
  /**
   * When an `href` prop is passed, ButtonIcon will automatically change the root element to be an `a` (anchor) tag
   */
  href: PropTypes.string,
  /**
   * The name of the icon to display. Should be one of ICON_NAMES
   */
  iconName: PropTypes.string.isRequired,
  /**
   * iconProps accepts all the props from Icon
   */
  iconProps: PropTypes.object,
  /**
   * The size of the ButtonIcon.
   * Possible values could be 'Size.SM' 24px, 'Size.LG' 32px,
   */
  size: PropTypes.string,
  /**
   * ButtonIcon accepts all the props from Box
   */
  ...IconButton.propTypes,
};
