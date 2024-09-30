import { Kyc } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import {
  getStrPaymentMethodInstance,
  humanizePaymentMethodName,
} from '../../../../shared/lib/payment-methods-utils';
import { ICON_NAMES, Icon, Text } from '../../../components/component-library';
import Box from '../../../components/ui/box/box';
import Button from '../../../components/ui/button';
import {
  AlignItems,
  BLOCK_SIZES,
  DISPLAY,
  IconColor,
  Size,
  TEXT_ALIGN,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  EXCHANGER_SETTINGS_ROUTE,
  P2P_ADD_PAYMENT_ROUTE,
  P2P_EDIT_PAYMENT_ROUTE,
} from '../../../helpers/constants/routes';
import { getMyPaymentMethods } from '../../../selectors';
import {
  dextradeRequest,
  removePaymentMethod,
  showModal,
} from '../../../store/actions';

class P2PPaymentList extends Component {
  static propTypes = {
    bankAccounts: PropTypes.array,
    history: PropTypes.object,
    removeItem: PropTypes.func,
    showPaymentMehtod: PropTypes.func,
    getKycInfo: PropTypes.func,
    startKycVerification: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const {
      bankAccounts,
      removeItem,
      history,
      showPaymentMehtod,
      startKycVerification,
      getKycInfo,
    } = this.props;

    return (
      <div className="settings-page__content-item settings-page__content-item--without-height">
        <Box
          display={DISPLAY.FLEX}
          alignItems={AlignItems.center}
          marginBottom={3}
        >
          <Box>
            <Text marginBottom={4}>Configure the exchanger</Text>
            <Button
              onClick={() => {
                history.push(EXCHANGER_SETTINGS_ROUTE);
              }}
              small
              large
              type="secondary"
            >
              Exchanger settings
            </Button>
          </Box>
        </Box>
        <Box
          display={DISPLAY.FLEX}
          alignItems={AlignItems.center}
          marginBottom={3}
        >
          <Text className="flex-grow">
            {this.context.t('myPaymentMethods')}
          </Text>
          <Box display={DISPLAY.FLEX}>
            <Button
              className="flex-shrink"
              onClick={() => {
                history.push(P2P_ADD_PAYMENT_ROUTE);
              }}
              small
              type="secondary"
            >
              <Icon name="add" marginRight={2} />
              Add
            </Button>
          </Box>
        </Box>
        {!bankAccounts.length && (
          <Text color={TextColor.textAlternative}>
            Payment methods are not created, add your first
          </Text>
        )}
        {bankAccounts.map((bankAccount) => (
          <div
            key={bankAccount.userPaymentMethodId}
            className="p2p-tab__link-item cursor-pointer"
          >
            <Button
              rounded
              className="link-item-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (e.target.classList.contains('link-item-btn__remove')) {
                  removeItem(bankAccount.userPaymentMethodId);
                } else if (
                  e.target.classList.contains('link-item-btn__setting')
                ) {
                  history.push(
                    `${P2P_EDIT_PAYMENT_ROUTE}/${bankAccount.userPaymentMethodId}`,
                  );
                } else {
                  showPaymentMehtod({
                    title: 'My payment method',
                    paymentMethod: bankAccount,
                  });
                }
              }}
            >
              <Box
                width={BLOCK_SIZES.FULL}
                textAlign={TEXT_ALIGN.LEFT}
                alignItems={AlignItems.center}
                display={DISPLAY.FLEX}
              >
                <div className="flex-grow">
                  <Text>
                    {humanizePaymentMethodName(
                      bankAccount.paymentMethod.name,
                      this.context.t,
                    )}
                  </Text>
                  <Text variant={TextVariant.bodyMdBold}>
                    {getStrPaymentMethodInstance(bankAccount)}
                  </Text>
                </div>
                <Icon
                  className="link-item-btn__remove"
                  name={ICON_NAMES.TRASH_DEX}
                  size={Size.XL}
                  color={IconColor.errorDefault}
                  marginRight={3}
                />
                <Icon name={ICON_NAMES.ARROW_RIGHT} />
              </Box>
            </Button>
          </div>
        ))}
        <Box marginTop={5}>
          <Text className="flex-grow" marginBottom={4}>
            KYC
          </Text>
          <Kyc
            getKycInfo={getKycInfo}
            startVerification={startKycVerification}
          />
        </Box>
      </div>
    );
  }
}

export default compose(
  withRouter,
  connect(
    (state) => {
      return {
        bankAccounts: getMyPaymentMethods(state),
      };
    },
    (dispatch) => ({
      removeItem: (id) => dispatch(removePaymentMethod(id)),
      startKycVerification: async () => {
        const url = await dispatch(dextradeRequest({ url: 'api/kyc/form' }));
        global.platform.openTab({ url });
      },
      getKycInfo: () =>
        dispatch(dextradeRequest({ url: 'api/kyc', showLoading: false })),
      showPaymentMehtod: ({ title, paymentMethod }) =>
        dispatch(
          showModal({
            name: 'PAYMENT_METHOD_VIEW',
            title,
            paymentMethod,
          }),
        ),
    }),
  ),
)(P2PPaymentList);
