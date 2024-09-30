import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { compose } from 'redux';
import { EXCHANGER_AD_EDIT_ROUTE } from '../../../helpers/constants/routes';
import {
  AlignItems,
  DISPLAY,
  FLEX_DIRECTION,
  Size,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import Box from '../../../components/ui/box/box';

import {
  AVATAR_ICON_SIZES,
  AvatarIcon,
  BUTTON_PRIMARY_SIZES,
  ButtonSecondary,
  ICON_NAMES,
  Icon,
  Text,
} from '../../../components/component-library';
import { Tab, Tabs } from '../../../components/ui/tabs';

import ToggleButton from '../../../components/ui/toggle-button';
import Popover from '../../../components/ui/popover';
import ExchangerHistory from '../../p2p-orders/components/p2p-history';
import { ExchangerType } from '../../../../shared/constants/exchanger';
import { RatingOutput } from '../../../components/app/rating-output';
import AccountOptionsMenu from './account-options-menu';
import ExchangerStatsCard from './exchange-stats-card';
import { ExchangerWrap } from './exchanger-wrap';

const TABS = {
  EXCHANGES: 'exchanges',
  HISTORY: 'history',
};

class ExchangerView extends Component {
  accountOptionsMenuOpen = null;

  constructor(props) {
    super(props);
    this.accountOptionsButtonElement = React.createRef();
    this.tabs = React.createRef();
  }

  state = {
    accountOptionsMenuOpen: false,
    errorView: null,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
  };

  closeOptions() {
    this.setState({
      accountOptionsMenuOpen: false,
    });
  }

  setTab(key) {
    const { tabs } = this;
    tabs.current.setActiveTabKey(key);
  }

  openOptions() {
    this.setState({
      accountOptionsMenuOpen: true,
    });
  }

  handleBlockExplorerClick(tx) {
    const blockExplorerLink = tx.chainInfo.transactionExplorerLink.replace(
      '{{txhash}}',
      tx.hash,
    );

    global.platform.openTab({
      url: blockExplorerLink,
    });
  }

  render() {
    const { t } = this.context;
    const { accountOptionsMenuOpen, errorView } = this.state;
    return (
      <>
        {errorView && (
          <Popover
            title={t('error')}
            open
            onClose={() =>
              this.setState({
                errorView: null,
              })
            }
          >
            <Box margin={4}>
              <Text>{errorView}</Text>
            </Box>
          </Popover>
        )}
        <ExchangerWrap>
          {({
            exchanger = {
              userInfo: {},
              exchangerSettings: [],
            },
            formattedTotalIncome,
            setActive,
            loading,
          }) => (
            <>
              <Box
                className="exchanger-view-header"
                display={DISPLAY.FLEX}
                flexDirection={FLEX_DIRECTION.COLUMN}
                gap={1}
              >
                <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
                  <AvatarIcon
                    size={AVATAR_ICON_SIZES.XL}
                    marginRight={3}
                    dextradeAvatarHash={exchanger.avatar}
                    onClick={() => this.openOptions()}
                  />
                  <div className="exchanger-view-header__name">
                    <strong className="nowrap">{exchanger?.name}</strong>
                    <Box
                      paddingTop={1}
                      display={DISPLAY.FLEX}
                      alignItems={AlignItems.center}
                    >
                      <RatingOutput {...exchanger?.rating} />
                    </Box>
                  </div>
                  <div className="exchanger-view-header__toggle">
                    <Text
                      variant={TextVariant.bodyLgMedium}
                      color={TextColor.primaryDefault}
                    >
                      + {formattedTotalIncome}
                    </Text>
                  </div>
                </Box>
                {accountOptionsMenuOpen && (
                  <AccountOptionsMenu
                    anchorElement={this.accountOptionsButtonElement.current}
                    onClose={() => this.closeOptions()}
                  />
                )}
                {Boolean(exchanger.exchangerSettings.length) && (
                  <Box marginTop={2}>
                    <ToggleButton
                      value={exchanger?.active}
                      disabled={loading}
                      statusMode
                      onToggle={(value) => setActive(!value)}
                      offLabel="Ads are off"
                      onLabel="Ads are on"
                    />
                  </Box>
                )}
              </Box>
              <Box marginTop={4}>
                {exchanger.exchangerSettings.length ? (
                  <Box className="exchanger-status-list">
                    {exchanger.exchangerSettings.map((exchangerSetting) => (
                      <ExchangerStatsCard
                        key={exchangerSetting.id}
                        exchangerSetting={exchangerSetting}
                        exchangerIsActive={exchanger.active}
                        marginTop={2}
                        marginBottom={4}
                        onClickForApproval={() => this.setTab(TABS.HISTORY)}
                      />
                    ))}
                  </Box>
                ) : (
                  <>
                    <span className="exchanger-view-content__not-configured">
                      {t('exchangerNotConfigured')}
                    </span>
                    <ButtonSecondary
                      size={BUTTON_PRIMARY_SIZES.LG}
                      className="exchanger-view-content__create-btn"
                      onClick={() =>
                        this.props.history.push(EXCHANGER_AD_EDIT_ROUTE)
                      }
                    >
                      {t('create')}
                    </ButtonSecondary>
                  </>
                )}
              </Box>
            </>
          )}
        </ExchangerWrap>
      </>
    );
  }
}

export default compose(withRouter)(ExchangerView);
