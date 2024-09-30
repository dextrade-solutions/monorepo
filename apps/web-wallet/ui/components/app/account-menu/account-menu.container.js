import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import {
  toggleAccountMenu,
  setSelectedAccount,
  lockMetamask,
  hideWarning,
  showModal,
  exchangerSetActive,
} from '../../../store/actions';
import {
  assetModel,
  getAddressConnectedSubjectMap,
  getCurrentCurrency,
  getExchanger,
  getMetaMaskAccountsOrdered,
  getMetaMaskKeyrings,
  getOriginOfCurrentTab,
  getSelectedAddress,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // getUnreadNotificationsCount,
  ///: END:ONLY_INCLUDE_IN
} from '../../../selectors';
import { getAllTokens } from '../../../ducks/metamask/metamask';
import AccountMenu from './account-menu.component';

/**
 * The min amount of accounts to show search field
 */
const SHOW_SEARCH_ACCOUNTS_MIN_COUNT = 5;

function mapStateToProps(state) {
  const {
    metamask: { isAccountMenuOpen },
    history: { mostRecentOverviewPage },
  } = state;
  const accounts = getMetaMaskAccountsOrdered(state);
  const allTokens = getAllTokens(state) || [];
  const origin = getOriginOfCurrentTab(state);
  const selectedAddress = getSelectedAddress(state);
  const exchanger = getExchanger(state);
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // const unreadNotificationsCount = getUnreadNotificationsCount(state);
  ///: END:ONLY_INCLUDE_IN

  const walletBalances = Object.entries(allTokens).reduce(
    (acc, [walletAddress, tokens]) => ({
      ...acc,
      [walletAddress]: tokens.reduce(
        (sum, token) => sum + Number(assetModel(state, token).balanceFiat),
        0,
      ),
    }),
    {},
  );
  return {
    walletBalances,
    isAccountMenuOpen,
    addressConnectedSubjectMap: getAddressConnectedSubjectMap(state),
    originOfCurrentTab: origin,
    selectedAddress,
    keyrings: getMetaMaskKeyrings(state),
    currentCurrency: getCurrentCurrency(state),
    allTokens,
    accounts,
    shouldShowAccountsSearch: accounts.length >= SHOW_SEARCH_ACCOUNTS_MIN_COUNT,
    exchanger,
    mostRecentOverviewPage,
    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    // unreadNotificationsCount,
    ///: END:ONLY_INCLUDE_IN
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleAccountMenu: () => dispatch(toggleAccountMenu()),
    lockMetamask: () => {
      dispatch(lockMetamask());
      dispatch(hideWarning());
      dispatch(toggleAccountMenu());
    },
    setSelectedAccount: (address) => {
      dispatch(setSelectedAccount(address));
      dispatch(toggleAccountMenu());
    },
    exchangerDisable: () => dispatch(exchangerSetActive(false)),
    showExchangerAlert: (callback) => {
      dispatch(
        showModal({
          name: 'EXCHANGER_WILL_DISABLED',
          callback,
        }),
      );
    },
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { exchanger, mostRecentOverviewPage } = stateProps;
  const { showExchangerAlert, exchangerDisable } = dispatchProps;
  const { history } = ownProps;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onClickSelectedAddress: () => {
      history.push(mostRecentOverviewPage);
      dispatchProps.toggleAccountMenu();
    },
    exchangerAlertWrap: (callback) => {
      if (exchanger?.active) {
        return showExchangerAlert(async () => {
          await exchangerDisable();
          return callback();
        });
      }
      return callback();
    },
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
)(AccountMenu);
