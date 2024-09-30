import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {
  getAllAccountsOnNetworkAreEmpty,
  getIsNetworkUsed,
  getNetworkIdentifier,
  getPreferences,
  isNetworkLoading,
  getTheme,
  getIsTestnet,
  getCurrentChainId,
  getShouldShowSeedPhraseReminder,
  isCurrentProviderCustom,
  getShowReloginDextrade,
} from '../../selectors';
import {
  dextradeRefreshApiKey,
  lockMetamask,
  setCurrentCurrency,
  setLastActiveTime,
  setMouseUserState,
  showLoadingIndication,
  showModal,
  toggleAccountMenu,
  walletConnect,
} from '../../store/actions';
import { pageChanged } from '../../ducks/history/history';
import { prepareToLeaveSwaps } from '../../ducks/swaps/swaps';
import { getSendStage } from '../../ducks/send';
import Routes from './routes.component';

function mapStateToProps(state) {
  const { appState } = state;
  const { alertOpen, alertMessage, isLoading, loadingMessage } = appState;
  const { autoLockTimeLimit = 0 } = getPreferences(state);
  const { completedOnboarding } = state.metamask;

  return {
    alertOpen,
    alertMessage,
    textDirection: state.metamask.textDirection,
    isLoading,
    loadingMessage,
    isUnlocked: state.metamask.isUnlocked,
    isNetworkLoading: isNetworkLoading(state),
    currentCurrency: state.metamask.currentCurrency,
    isMouseUser: state.appState.isMouseUser,
    autoLockTimeLimit,
    browserEnvironmentOs: state.metamask.browserEnvironment?.os,
    browserEnvironmentContainter: state.metamask.browserEnvironment?.browser,
    providerId: getNetworkIdentifier(state),
    providerType: state.metamask.provider?.type,
    theme: getTheme(state),
    sendStage: getSendStage(state),
    isNetworkUsed: getIsNetworkUsed(state),
    allAccountsOnNetworkAreEmpty: getAllAccountsOnNetworkAreEmpty(state),
    isTestNet: getIsTestnet(state),
    currentChainId: getCurrentChainId(state),
    shouldShowSeedPhraseReminder: getShouldShowSeedPhraseReminder(state),
    forgottenPassword: state.metamask.forgottenPassword,
    isCurrentProviderCustom: isCurrentProviderCustom(state),
    completedOnboarding,
    isAccountMenuOpen: state.metamask.isAccountMenuOpen,
    showReloginDextrade: getShowReloginDextrade(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    lockMetaMask: () => dispatch(lockMetamask(false)),
    setCurrentCurrencyToUSD: () => dispatch(setCurrentCurrency('usd')),
    setMouseUserState: (isMouseUser) =>
      dispatch(setMouseUserState(isMouseUser)),
    setLastActiveTime: () => dispatch(setLastActiveTime()),
    pageChanged: (path) => dispatch(pageChanged(path)),
    prepareToLeaveSwaps: () => dispatch(prepareToLeaveSwaps()),
    toggleAccountMenu: () => dispatch(toggleAccountMenu()),
    showLoadingIndication: () => dispatch(showLoadingIndication()),
    walletConnect: (data) => dispatch(walletConnect(data)),
    showDextradeRefreshApiKeyConfirmation: () => {
      dispatch(
        showModal({
          name: 'CONFIRMATION',
          title: 'P2P services authentication error',
          description: `The network is not working
          normally. Please retry the
          connection, or try again later`,
          modalProps: {
            cancelText: 'Cancel',
            submitText: 'Try again',
          },
          callback: () => dispatch(dextradeRefreshApiKey()),
        }),
      );
    },
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Routes);
