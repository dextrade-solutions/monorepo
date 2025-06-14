import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import SiteOrigin from '../../ui/site-origin';
import Box from '../../ui/box';
import {
  FLEX_DIRECTION,
  JustifyContent,
} from '../../../helpers/constants/design-system';

export default class PermissionsConnectHeader extends Component {
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  static contextTypes = {
    t: PropTypes.func,
  };
  ///: END:ONLY_INCLUDE_IN

  static propTypes = {
    className: PropTypes.string,
    iconUrl: PropTypes.string,
    iconName: PropTypes.string.isRequired,
    siteOrigin: PropTypes.string.isRequired,
    headerTitle: PropTypes.node,
    boxProps: PropTypes.shape({ ...Box.propTypes }),
    headerText: PropTypes.string,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    snapVersion: PropTypes.string,
    isSnapInstallOrUpdate: PropTypes.bool,
    ///: END:ONLY_INCLUDE_IN
  };

  static defaultProps = {
    iconUrl: null,
    headerTitle: '',
    headerText: '',
    boxProps: {},
  };

  renderHeaderIcon() {
    const {
      iconUrl,
      iconName,
      siteOrigin,
      leftIcon,
      rightIcon,
      ///: BEGIN:ONLY_INCLUDE_IN(flask)
      isSnapInstallOrUpdate,
      ///: END:ONLY_INCLUDE_IN
    } = this.props;

    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    if (isSnapInstallOrUpdate) {
      return null;
    }
    ///: END:ONLY_INCLUDE_IN

    return (
      <div className="permissions-connect-header__icon">
        <SiteOrigin
          chip
          siteOrigin={siteOrigin}
          iconSrc={iconUrl}
          name={iconName}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
        />
      </div>
    );
  }

  render() {
    const { boxProps, className, headerTitle, headerText } = this.props;
    return (
      <Box
        className={classnames('permissions-connect-header', className)}
        flexDirection={FLEX_DIRECTION.COLUMN}
        justifyContent={JustifyContent.center}
        {...boxProps}
      >
        {this.renderHeaderIcon()}
        <div className="permissions-connect-header__title">{headerTitle}</div>
        <div className="permissions-connect-header__subtitle">{headerText}</div>
      </Box>
    );
  }
}
