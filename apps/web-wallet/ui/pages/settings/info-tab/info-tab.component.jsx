///: BEGIN:ONLY_INCLUDE_IN(pwa)
import OneSignal from 'react-onesignal';
///: END:ONLY_INCLUDE_IN
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import Button from '../../../components/ui/button';
import {
  ButtonPrimary,
  Tag,
  Text,
} from '../../../components/component-library';

import { DEXTRADE_BASE_URL, SUPPORT_REQUEST_LINK } from '../../../helpers/constants/common';
import { isBeta } from '../../../helpers/utils/build-types';
import {
  getNumberOfSettingsInSection,
  handleSettingsRefs,
} from '../../../helpers/utils/settings-search';
import {
  EVENT,
  EVENT_NAMES,
  CONTEXT_PROPS,
} from '../../../../shared/constants/metametrics';
import { SUPPORT_LINK } from '../../../../shared/lib/ui-utils';
import { getMnemonicHash } from '../../../selectors';
import Box from '../../../components/ui/box';
import { TextVariant } from '../../../helpers/constants/design-system';

class InfoTab extends PureComponent {
  propTypes = {
    mnemonicHash: PropTypes.string,
  };

  state = {
    version: global.platform.getVersion(),
    ///: BEGIN:ONLY_INCLUDE_IN(pwa)
    ons: {
      id: OneSignal.User.PushSubscription.id,
      permission: String(OneSignal.Notifications.permission),
      support: String(OneSignal.Notifications.isPushSupported()),
    },
    ///: END:ONLY_INCLUDE_IN
    errorPush: null,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  settingsRefs = Array(
    getNumberOfSettingsInSection(this.context.t, this.context.t('about')),
  )
    .fill(undefined)
    .map(() => {
      return React.createRef();
    });

  componentDidUpdate() {
    const { t } = this.context;
    handleSettingsRefs(t, t('about'), this.settingsRefs);
  }

  componentDidMount() {
    const { t } = this.context;
    handleSettingsRefs(t, t('about'), this.settingsRefs);
    ///: BEGIN:ONLY_INCLUDE_IN(pwa)
    OneSignal.login(this.props.mnemonicHash).finally(() => {
      this.setState({
        ons: {
          id: OneSignal.User.PushSubscription.id,
          permission: String(OneSignal.Notifications.permission),
          support: String(OneSignal.Notifications.isPushSupported()),
        },
      });
    });
    ///: END:ONLY_INCLUDE_IN
  }

  ///: BEGIN:ONLY_INCLUDE_IN(pwa)
  async requestPush() {
    try {
      await OneSignal.Notifications.requestPermission();
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: "['Test push']\n",
      };

      fetch(
        `${DEXTRADE_BASE_URL}/public/push?title=c1&mnemonicHash=${mnemonicHash}`,
        options,
      );
    } catch (e) {
      console.error(e);
      this.setState({
        errorPush: e,
      });
    }
  }
  ///: END:ONLY_INCLUDE_IN

  renderInfoLinks() {
    const { t } = this.context;
    const { mnemonicHash } = this.props;
    const { ons, errorPush } = this.state;

    return (
      <div className="settings-page__content-item settings-page__content-item--without-height">
        <div ref={this.settingsRefs[1]} className="info-tab__link-header">
          {t('links')}
        </div>
        <div ref={this.settingsRefs[2]} className="info-tab__link-item">
          <Button
            type="link"
            href="https://dextrade.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            {t('privacyMsg')}
          </Button>
        </div>
        <div ref={this.settingsRefs[3]} className="info-tab__link-item">
          <Button
            type="link"
            href="https://dextrade.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            {t('terms')}
          </Button>
        </div>
        {isBeta() ? (
          <div ref={this.settingsRefs[8]} className="info-tab__link-item">
            <Button
              type="link"
              href="https://metamask.io/beta-terms.html"
              target="_blank"
              rel="noopener noreferrer"
              className="info-tab__link-text"
            >
              {t('betaTerms')}
              <Tag label={t('new')} className="info-tab__tag" />
            </Button>
          </div>
        ) : null}
        <div ref={this.settingsRefs[4]} className="info-tab__link-item">
          <Button
            type="link"
            href="https://dextrade.com/attributions"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            {t('attributions')}
          </Button>
        </div>
        <hr className="info-tab__separator" />
        <div ref={this.settingsRefs[5]} className="info-tab__link-item">
          <Button
            type="link"
            href={SUPPORT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
            onClick={() => {
              this.context.trackEvent(
                {
                  category: EVENT.CATEGORIES.SETTINGS,
                  event: EVENT_NAMES.SUPPORT_LINK_CLICKED,
                  properties: {
                    url: SUPPORT_LINK,
                  },
                },
                {
                  contextPropsIntoEventProperties: [CONTEXT_PROPS.PAGE_TITLE],
                },
              );
            }}
          >
            {t('supportCenter')}
          </Button>
        </div>
        <div ref={this.settingsRefs[6]} className="info-tab__link-item">
          <Button
            type="link"
            href="https://dextrade.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            {t('visitWebSite')}
          </Button>
        </div>
        <div ref={this.settingsRefs[7]} className="info-tab__link-item">
          <Button
            type="link"
            href={SUPPORT_REQUEST_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
            onClick={() => {
              this.context.trackEvent(
                {
                  category: EVENT.CATEGORIES.SETTINGS,
                  event: EVENT_NAMES.SUPPORT_LINK_CLICKED,
                  properties: {
                    url: SUPPORT_REQUEST_LINK,
                  },
                },
                {
                  contextPropsIntoEventProperties: [CONTEXT_PROPS.PAGE_TITLE],
                },
              );
            }}
          >
            {t('contactUs')}
          </Button>
        </div>
        <hr className="info-tab__separator" />
        <div ref={this.settingsRefs[1]} className="info-tab__link-header">
          Debug info
        </div>
        <div ref={this.settingsRefs[7]} className="info-tab__link-item">
          <div style={{ lineBreak: 'anywhere' }}>
            <Text>Mnemonic Hash: {mnemonicHash}</Text>

            {ons && (
              <Box marginTop={2}>
                <Text variant={TextVariant.bodyMdBold}>One signal</Text>
                <Text>Subscription id: {ons.id}</Text>
                <Text>Permission: {ons.permission}</Text>
                <Text>Support: {ons.support}</Text>
                <Text>{errorPush && errorPush.message}</Text>
                <ButtonPrimary marginTop={2} onClick={() => this.requestPush()}>
                  Request push
                </ButtonPrimary>
              </Box>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.context;

    return (
      <div className="settings-page__body">
        <div className="settings-page__content-row">
          <div className="settings-page__content-item settings-page__content-item--without-height">
            <div className="info-tab__item">
              <div
                ref={this.settingsRefs[0]}
                className="info-tab__version-header"
              >
                {isBeta() ? t('betaMetamaskVersion') : t('metamaskVersion')}
              </div>
              <div className="info-tab__version-number">
                {this.state.version}
              </div>
            </div>
            <div className="info-tab__item">
              <div className="info-tab__about">{t('builtAroundTheWorld')}</div>
            </div>
          </div>
          {this.renderInfoLinks()}
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    mnemonicHash: getMnemonicHash(state),
  }),
  null,
)(InfoTab);
