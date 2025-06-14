import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { matchPath, Route, Switch } from 'react-router-dom';
import IdleTimer from 'react-idle-timer';

///: BEGIN:ONLY_INCLUDE_IN(flask)
// import browserAPI from 'webextension-polyfill';
///: END:ONLY_INCLUDE_IN
import SendTransactionScreen from '../send';
import Swaps from '../swaps';
import Exchanger from '../exchanger';
import ConfirmTransaction from '../confirm-transaction';
import Home from '../home';
import Settings from '../settings';
import Authenticated from '../../helpers/higher-order-components/authenticated';
import Initialized from '../../helpers/higher-order-components/initialized';
import Lock from '../lock';
import PermissionsConnect from '../permissions-connect';
import RestoreVaultPage from '../keychains/restore-vault';
import RevealSeedConfirmation from '../keychains/reveal-seed';
import MobileSyncPage from '../mobile-sync';
import ImportTokenPage from '../import-token';
import AddNftPage from '../add-nft';
import ConfirmImportTokenPage from '../confirm-import-token';
import ConfirmAddSuggestedTokenPage from '../confirm-add-suggested-token';
import CreateAccountPage from '../create-account';
import Loading from '../../components/ui/loading-screen';
import NetworkDropdown from '../../components/app/dropdowns/network-dropdown';
import AccountMenu from '../../components/app/account-menu';
import { Modal } from '../../components/app/modals';
import Alert from '../../components/ui/alert';
import AppHeader from '../../components/app/app-header';
import UnlockPage from '../unlock-page';
import Alerts from '../../components/app/alerts';
import Asset from '../asset';
import OnboardingAppHeader from '../onboarding-flow/onboarding-app-header/onboarding-app-header';
import TokenDetailsPage from '../token-details';
import MultisignerCreatePage from '../multisigner-create-page';
import MultiSignatureSendPage from '../multisigner-send-page';
import MultiSignaturePage from '../multisigner-page';

///: BEGIN:ONLY_INCLUDE_IN(flask)
// import Notifications from '../notifications';
// import { registerOnDesktopDisconnect } from '../../hooks/desktopHooks';
// import DesktopErrorPage from '../desktop-error';
// import DesktopPairingPage from '../desktop-pairing';
///: END:ONLY_INCLUDE_IN

import {
  IMPORT_TOKEN_ROUTE,
  ASSET_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  CONNECT_ROUTE,
  DEFAULT_ROUTE,
  LOCK_ROUTE,
  MOBILE_SYNC_ROUTE,
  NEW_ACCOUNT_ROUTE,
  RESTORE_VAULT_ROUTE,
  REVEAL_SEED_ROUTE,
  SEND_ROUTE,
  SWAPS_ROUTE,
  EXCHANGER_ROUTE,
  SETTINGS_ROUTE,
  UNLOCK_ROUTE,
  BUILD_QUOTE_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
  CONFIRM_IMPORT_TOKEN_ROUTE,
  ONBOARDING_ROUTE,
  ADD_NFT_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
  TOKEN_DETAILS,
  MULTISIG_CREATE_ROUTE,
  MULTISIG_ROUTE,
  P2P_TRANSACTIONS,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  DESKTOP_ERROR_ROUTE,
  ///: END:ONLY_INCLUDE_IN
} from '../../helpers/constants/routes';

///: BEGIN:ONLY_INCLUDE_IN(flask)
import { EXTENSION_ERROR_PAGE_TYPES } from '../../../shared/constants/desktop';
///: END:ONLY_INCLUDE_IN

import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../../shared/constants/app';
import { NETWORK_TYPES } from '../../../shared/constants/network';
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import ConfirmationPage from '../confirmation';
import OnboardingFlow from '../onboarding-flow/onboarding-flow';
import QRHardwarePopover from '../../components/app/qr-hardware-popover';
import { SEND_STAGES } from '../../ducks/send';
// import DeprecatedTestNetworks from '../../components/ui/deprecated-test-networks/deprecated-test-networks';
// import NewNetworkInfo from '../../components/ui/new-network-info/new-network-info';
import { ThemeType } from '../../../shared/constants/preferences';
import { AccountListMenu } from '../../components/multichain';
import P2POrders from '../p2p-orders';

export default class Routes extends Component {
  static propTypes = {
    currentCurrency: PropTypes.string,
    setCurrentCurrencyToUSD: PropTypes.func,
    isLoading: PropTypes.bool,
    loadingMessage: PropTypes.string,
    alertMessage: PropTypes.string,
    textDirection: PropTypes.string,
    isNetworkLoading: PropTypes.bool,
    alertOpen: PropTypes.bool,
    isUnlocked: PropTypes.bool,
    setLastActiveTime: PropTypes.func,
    history: PropTypes.object,
    location: PropTypes.object,
    lockMetaMask: PropTypes.func,
    isMouseUser: PropTypes.bool,
    setMouseUserState: PropTypes.func,
    providerId: PropTypes.string,
    providerType: PropTypes.string,
    autoLockTimeLimit: PropTypes.number,
    pageChanged: PropTypes.func.isRequired,
    prepareToLeaveSwaps: PropTypes.func,
    browserEnvironmentOs: PropTypes.string,
    browserEnvironmentBrowser: PropTypes.string,
    theme: PropTypes.string,
    sendStage: PropTypes.string,
    forgottenPassword: PropTypes.bool,
    // isNetworkUsed: PropTypes.bool,
    // allAccountsOnNetworkAreEmpty: PropTypes.bool,
    // isTestNet: PropTypes.bool,
    // currentChainId: PropTypes.string,
    // shouldShowSeedPhraseReminder: PropTypes.bool,
    // isCurrentProviderCustom: PropTypes.bool,
    // completedOnboarding: PropTypes.bool,
    isAccountMenuOpen: PropTypes.bool,
    toggleAccountMenu: PropTypes.func,
    walletConnect: PropTypes.func,
    showReloginDextrade: PropTypes.bool,
    showDextradeRefreshApiKeyConfirmation: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  handleOsTheme() {
    const osTheme = window?.matchMedia('(prefers-color-scheme: dark)')?.matches
      ? ThemeType.dark
      : ThemeType.light;

    document.documentElement.setAttribute('data-theme', osTheme);
  }

  componentDidMount() {
    if (global.location.pathname === '/wc') {
      // WalletConnect v2 deeplink hanling
      const connString = new URLSearchParams(global.location.search).get('uri');
      this.props.walletConnect({ wcUri: connString, deeplink: true });
    }
    // const { history } = this.props;
    // if (isPwa) {
    //   backgroundConnection.controller.on('showUserConfirmation', () => {
    //     history.push(DEFAULT_ROUTE);
    //   });
    // }
    // const { history } = this.props;
    // browserAPI.runtime.onMessage.addListener(
    //   registerOnDesktopDisconnect(history),
    // );
  }

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // componentWillUnmount() {
  //   const { history } = this.props;
  //   browserAPI.runtime.onMessage.removeListener(
  //     registerOnDesktopDisconnect(history),
  //   );
  // }
  ///: END:ONLY_INCLUDE_IN

  componentDidUpdate(prevProps) {
    const {
      theme,
      showDextradeRefreshApiKeyConfirmation,
      showReloginDextrade,
    } = this.props;

    if (theme !== prevProps.theme) {
      if (theme === ThemeType.os) {
        this.handleOsTheme();
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
    if (showReloginDextrade) {
      showDextradeRefreshApiKeyConfirmation();
    }
  }

  UNSAFE_componentWillMount() {
    const {
      currentCurrency,
      pageChanged,
      setCurrentCurrencyToUSD,
      history,
      theme,
    } = this.props;
    if (!currentCurrency) {
      setCurrentCurrencyToUSD();
    }

    history.listen((locationObj, action) => {
      if (action === 'PUSH') {
        pageChanged(locationObj.pathname);
      }
    });
    if (theme === ThemeType.os) {
      this.handleOsTheme();
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  renderRoutes() {
    const { autoLockTimeLimit, setLastActiveTime, forgottenPassword } =
      this.props;
    const RestoreVaultComponent = forgottenPassword ? Route : Initialized;

    const routes = (
      <Switch>
        <Route path={ONBOARDING_ROUTE} component={OnboardingFlow} />
        <Route path={LOCK_ROUTE} component={Lock} exact />
        {
          ///: BEGIN:ONLY_INCLUDE_IN(flask)
          // <Route
          //   path={`${DESKTOP_ERROR_ROUTE}/:errorType`}
          //   component={DesktopErrorPage}
          //   exact
          // />
          ///: END:ONLY_INCLUDE_IN
        }
        <Initialized path={UNLOCK_ROUTE} component={UnlockPage} exact />
        <RestoreVaultComponent
          path={RESTORE_VAULT_ROUTE}
          component={RestoreVaultPage}
          exact
        />
        <Authenticated
          path={REVEAL_SEED_ROUTE}
          component={RevealSeedConfirmation}
          exact
        />
        <Authenticated
          path={MOBILE_SYNC_ROUTE}
          component={MobileSyncPage}
          exact
        />
        <Authenticated path={SETTINGS_ROUTE} component={Settings} />
        {
          ///: BEGIN:ONLY_INCLUDE_IN(flask)
          // <Authenticated path={NOTIFICATIONS_ROUTE} component={Notifications} />
          ///: END:ONLY_INCLUDE_IN
        }
        <Authenticated
          path={`${CONFIRM_TRANSACTION_ROUTE}/:id?`}
          component={ConfirmTransaction}
        />
        <Authenticated
          path={SEND_ROUTE}
          component={SendTransactionScreen}
          exact
        />
        <Authenticated
          path={`${TOKEN_DETAILS}/:address/`}
          component={TokenDetailsPage}
          exact
        />
        <Authenticated path={SWAPS_ROUTE} component={Swaps} />
        <Authenticated path={EXCHANGER_ROUTE} component={Exchanger} />
        <Authenticated path={P2P_TRANSACTIONS} component={P2POrders} />
        <Authenticated
          path={IMPORT_TOKEN_ROUTE}
          component={ImportTokenPage}
          exact
        />
        <Authenticated path={ADD_NFT_ROUTE} component={AddNftPage} exact />
        <Authenticated
          path={CONFIRM_IMPORT_TOKEN_ROUTE}
          component={ConfirmImportTokenPage}
          exact
        />
        <Authenticated
          path={CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE}
          component={ConfirmAddSuggestedTokenPage}
          exact
        />
        <Authenticated
          path={CONFIRMATION_V_NEXT_ROUTE}
          component={ConfirmationPage}
        />
        <Authenticated path={NEW_ACCOUNT_ROUTE} component={CreateAccountPage} />
        <Authenticated
          path={`${CONNECT_ROUTE}/:id`}
          component={PermissionsConnect}
        />
        <Authenticated path={`${ASSET_ROUTE}/:asset/:id`} component={Asset} />
        <Authenticated path={`${ASSET_ROUTE}/:asset/`} component={Asset} />
        <Authenticated
          path={MULTISIG_CREATE_ROUTE}
          component={MultisignerCreatePage}
        />
        <Authenticated
          path={`${MULTISIG_ROUTE}/:id/send`}
          component={MultiSignatureSendPage}
        />
        <Authenticated
          path={`${MULTISIG_ROUTE}/:id/`}
          component={MultiSignaturePage}
        />
        {
          ///: BEGIN:ONLY_INCLUDE_IN(flask)
          // <Authenticated
          //   path={DESKTOP_PAIRING_ROUTE}
          //   component={DesktopPairingPage}
          //   exact
          // />
          ///: END:ONLY_INCLUDE_IN
        }
        <Authenticated path={DEFAULT_ROUTE} component={Home} />
      </Switch>
    );

    if (autoLockTimeLimit > 0) {
      return (
        <IdleTimer onAction={setLastActiveTime} throttle={1000}>
          {routes}
        </IdleTimer>
      );
    }

    return routes;
  }

  onInitializationUnlockPage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, {
        path: ONBOARDING_UNLOCK_ROUTE,
        exact: true,
      }),
    );
  }

  onConfirmPage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, {
        path: CONFIRM_TRANSACTION_ROUTE,
        exact: false,
      }),
    );
  }

  onEditTransactionPage() {
    return this.props.sendStage === SEND_STAGES.EDIT;
  }

  onSwapsPage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, { path: SWAPS_ROUTE, exact: false }),
    );
  }

  onSwapsBuildQuotePage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, { path: BUILD_QUOTE_ROUTE, exact: false }),
    );
  }

  hideAppHeader() {
    const { location } = this.props;

    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    const isDesktopConnectionLostScreen = Boolean(
      matchPath(location.pathname, {
        path: `${DESKTOP_ERROR_ROUTE}/${EXTENSION_ERROR_PAGE_TYPES.CONNECTION_LOST}`,
        exact: true,
      }),
    );

    if (isDesktopConnectionLostScreen) {
      return true;
    }
    ///: END:ONLY_INCLUDE_IN

    const isInitializing = Boolean(
      matchPath(location.pathname, {
        path: ONBOARDING_ROUTE,
        exact: false,
      }),
    );

    if (isInitializing && !this.onInitializationUnlockPage()) {
      return true;
    }

    const windowType = getEnvironmentType();

    if (windowType === ENVIRONMENT_TYPE_NOTIFICATION) {
      return true;
    }

    if (windowType === ENVIRONMENT_TYPE_POPUP && this.onConfirmPage()) {
      return true;
    }

    const isHandlingPermissionsRequest = Boolean(
      matchPath(location.pathname, {
        path: CONNECT_ROUTE,
        exact: false,
      }),
    );

    const isHandlingAddEthereumChainRequest = Boolean(
      matchPath(location.pathname, {
        path: CONFIRMATION_V_NEXT_ROUTE,
        exact: false,
      }),
    );

    return isHandlingPermissionsRequest || isHandlingAddEthereumChainRequest;
  }

  showOnboardingHeader() {
    const { location } = this.props;

    return Boolean(
      matchPath(location.pathname, {
        path: ONBOARDING_ROUTE,
        exact: false,
      }),
    );
  }

  onAppHeaderClick = async () => {
    const { prepareToLeaveSwaps } = this.props;
    if (this.onSwapsPage()) {
      await prepareToLeaveSwaps();
    }
  };

  onWalletConnect = () => {
    const { history } = this.props;
    history.push(DEFAULT_ROUTE);
  };

  render() {
    const {
      isLoading,
      isUnlocked,
      alertMessage,
      textDirection,
      loadingMessage,
      isNetworkLoading,
      setMouseUserState,
      isMouseUser,
      browserEnvironmentOs: os,
      browserEnvironmentBrowser: browser,
      isAccountMenuOpen,
      toggleAccountMenu,
    } = this.props;
    const loadMessage =
      loadingMessage || isNetworkLoading
        ? this.getConnectingLabel(loadingMessage)
        : null;

    return (
      <div
        className={classnames('app', {
          [`os-${os}`]: os,
          [`browser-${browser}`]: browser,
          'mouse-user-styles': isMouseUser,
        })}
        dir={textDirection}
        onClick={() => setMouseUserState(true)}
        onKeyDown={(e) => {
          if (e.keyCode === 9) {
            setMouseUserState(false);
          }
        }}
      >
        {/* {shouldShowNetworkDeprecationWarning && <DeprecatedTestNetworks />} */}
        {/* {shouldShowNetworkInfo && <NewNetworkInfo />} */}
        <QRHardwarePopover />
        <Modal />
        <Alert visible={this.props.alertOpen} msg={alertMessage} />
        {!this.hideAppHeader() && (
          <AppHeader
            hideNetworkIndicator={this.onInitializationUnlockPage()}
            disableNetworkIndicator={this.onSwapsPage()}
            onClick={this.onAppHeaderClick}
            onWalletConnect={this.onWalletConnect}
            disabled={
              this.onConfirmPage() ||
              this.onEditTransactionPage() ||
              (this.onSwapsPage() && !this.onSwapsBuildQuotePage())
            }
          />
        )}
        {this.showOnboardingHeader() && <OnboardingAppHeader />}
        <NetworkDropdown />
        {process.env.MULTICHAIN ? null : <AccountMenu />}
        {process.env.MULTICHAIN && isAccountMenuOpen ? (
          <AccountListMenu onClose={() => toggleAccountMenu()} />
        ) : null}
        <div className="main-container-wrapper">
          {isLoading ? <Loading loadingMessage={loadMessage} /> : null}
          {this.renderRoutes()}
        </div>
        {isUnlocked ? <Alerts history={this.props.history} /> : null}
      </div>
    );
  }

  toggleMetamaskActive() {
    if (this.props.isUnlocked) {
      // currently active: deactivate
      this.props.lockMetaMask();
    } else {
      // currently inactive: redirect to password box
      const passwordBox = document.querySelector('input[type=password]');
      if (!passwordBox) {
        return;
      }
      passwordBox.focus();
    }
  }

  getConnectingLabel(loadingMessage) {
    if (loadingMessage) {
      return loadingMessage;
    }
    const { providerType, providerId } = this.props;
    const { t } = this.context;

    switch (providerType) {
      case NETWORK_TYPES.MAINNET:
        return t('connectingToMainnet');
      case NETWORK_TYPES.GOERLI:
        return t('connectingToGoerli');
      case NETWORK_TYPES.SEPOLIA:
        return t('connectingToSepolia');
      case NETWORK_TYPES.LINEA_TESTNET:
        return t('connectingToLineaTestnet');
      default:
        return t('connectingTo', [providerId]);
    }
  }
}
