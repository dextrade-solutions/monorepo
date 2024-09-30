import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { usePrevious } from '../../../hooks/usePrevious';
import { MILLISECOND } from '../../../../shared/constants/time';
import Box from '../box/box';
import {
  AlertTypes,
  BackgroundColor,
  Color,
  DISPLAY,
} from '../../../helpers/constants/design-system';
import { ICON_NAMES, Icon } from '../../component-library';
import Button from '../button';

const ALERT_TYPES = {
  [AlertTypes.info]: {
    icon: <Icon name={ICON_NAMES.INFO} color={Color.primaryInverse} />,
    backgroundColor: BackgroundColor.primaryDefault,
  },
  [AlertTypes.warning]: {
    icon: <Icon name={ICON_NAMES.WARNING} color={Color.warningInverse} />,
    backgroundColor: BackgroundColor.warningDefault,
    confirmButton: <Button outline>Confirm</Button>,
  },
};

/**
 * @param options0
 * @param options0.visible
 * @param options0.msg
 * @param options0.children
 * @param options0.type
 * @deprecated Use BannerAlert
 */
function Alert({
  visible: visibleInitial,
  msg,
  children,
  type = 'info',
  ...restProps
}) {
  const [visible, setVisible] = useState(false);
  const [className, setClassName] = useState('');
  const lastVisible = usePrevious(visibleInitial);

  useEffect(() => {
    const animateIn = () => {
      setClassName('visible');
      setVisible(true);
    };

    const animateOut = () => {
      setClassName('hidden');

      setTimeout((_) => {
        setVisible(false);
      }, MILLISECOND * 500);
    };

    if (!lastVisible && visibleInitial) {
      animateIn(msg);
    } else if (lastVisible && !visibleInitial) {
      animateOut();
    }
  }, [lastVisible, msg, visibleInitial]);

  if (!visible) {
    return null;
  }

  return (
    <Box
      {...restProps}
      display={DISPLAY.FLEX}
      backgroundColor={ALERT_TYPES[type].backgroundColor}
      className={classnames('global-alert', className)}
    >
      <Box marginLeft={1} marginRight={1}>
        {ALERT_TYPES[type].icon}
      </Box>
      <Box marginRight={2}>
        <a className="msg">{msg || children}</a>
      </Box>
      <Box>{ALERT_TYPES[type].confirmButton}</Box>
    </Box>
  );
}

Alert.propTypes = {
  visible: PropTypes.bool.isRequired,
  msg: PropTypes.string,
  children: PropTypes.node,
  ...Box.propTypes,
};

export default Alert;
