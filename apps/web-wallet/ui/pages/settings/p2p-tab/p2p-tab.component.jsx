import { Kyc } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
// import { compose } from 'redux';
// import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import P2PPaymentEditComponent from './p2p-payment-edit.component';
import P2PPaymentListComponent from './p2p-settings.component';
import {
  EXCHANGER_SETTINGS_ROUTE,
  P2P_ADD_PAYMENT_ROUTE,
  P2P_CONFIG_ROUTE,
  P2P_EDIT_PAYMENT_ROUTE,
  P2P_KYC,
} from '../../../helpers/constants/routes';
import {
  getNumberOfSettingsInSection,
  handleSettingsRefs,
} from '../../../helpers/utils/settings-search';
import ExchangerForm from '../../exchanger/exchanger-settings/exchanger-form';

class P2PTab extends PureComponent {
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
  }

  render() {
    return (
      <div className="settings-page__body">
        <div className="settings-page__content-row p2p-tab">
          <Switch>
            <Route
              exact
              path={P2P_CONFIG_ROUTE}
              component={P2PPaymentListComponent}
            />
            <Route
              exact
              path={P2P_ADD_PAYMENT_ROUTE}
              component={P2PPaymentEditComponent}
            />
            <Route
              exact
              path={`${P2P_EDIT_PAYMENT_ROUTE}/:id`}
              component={P2PPaymentEditComponent}
            />
            <Route
              exact
              path={EXCHANGER_SETTINGS_ROUTE}
              component={() => <ExchangerForm />}
            />
            <Route exact path={P2P_KYC} component={Kyc} />
          </Switch>
        </div>
      </div>
    );
  }
}
export default P2PTab;
