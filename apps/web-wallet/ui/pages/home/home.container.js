import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  activeTabHasPermissions,
  getFirstPermissionRequest,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  getFirstSnapInstallOrUpdateRequest,
  ///: END:ONLY_INCLUDE_IN
  getIsMainnet,
  getOriginOfCurrentTab,
  getTotalUnapprovedCount,
  getUnapprovedTemplatedConfirmations,
  getWeb3ShimUsageStateForOrigin,
  unconfirmedTransactionsCountSelector,
  getInfuraBlocked,
  getShowWhatsNewPopup,
  getSortedAnnouncementsToShow,
  getShowRecoveryPhraseReminder,
  getShowOutdatedBrowserWarning,
  getNewNetworkAdded,
  hasUnsignedQRHardwareTransaction,
  hasUnsignedQRHardwareMessage,
  getNewNftAddedMessage,
  getNewTokensImported,
  getShouldShowSeedPhraseReminder,
  getRemoveNftMessage,
} from '../../selectors';

import {
  closeNotificationPopup,
  setConnectedStatusPopoverHasBeenShown,
  setDefaultHomeActiveTabName,
  setWeb3ShimUsageAlertDismissed,
  setAlertEnabledness,
  setRecoveryPhraseReminderHasBeenShown,
  setRecoveryPhraseReminderLastShown,
  setNewNftAddedMessage,
  setRemoveNftMessage,
  setNewTokensImported,
  setNewNetworkAdded,
} from '../../store/actions';
import { hideWhatsNewPopup } from '../../ducks/app/app';
import { getWeb3ShimUsageAlertEnabledness } from '../../ducks/metamask/metamask';
import { getSwapsFeatureIsLive } from '../../ducks/swaps/swaps';
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import { getIsBrowserDeprecated } from '../../helpers/utils/util';
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../../shared/constants/app';
import {
  AlertTypes,
  Web3ShimUsageAlertStates,
} from '../../../shared/constants/alerts';
import Home from './home.component';

const mapStateToProps = (state) => {
  const { metamask, appState } = state;
  const {
    suggestedAssets,
    seedPhraseBackedUp,
    connectedStatusPopoverHasBeenShown,
    defaultHomeActiveTabName,
    swapsState,
    firstTimeFlowType,
    completedOnboarding,
  } = metamask;
  const { forgottenPassword } = metamask;
  const totalUnapprovedCount = getTotalUnapprovedCount(state);
  const swapsEnabled = getSwapsFeatureIsLive(state);
  const pendingConfirmations = getUnapprovedTemplatedConfirmations(state);

  const envType = getEnvironmentType();
  const isPopup = envType === ENVIRONMENT_TYPE_POPUP;
  const isNotification = envType === ENVIRONMENT_TYPE_NOTIFICATION;

  let firstPermissionsRequest, firstPermissionsRequestId;
  firstPermissionsRequest = getFirstPermissionRequest(state);
  firstPermissionsRequestId = firstPermissionsRequest?.metadata.id || null;

  // getFirstPermissionRequest should be updated with snap update logic once we hit main extension release

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  if (!firstPermissionsRequest) {
    firstPermissionsRequest = getFirstSnapInstallOrUpdateRequest(state);
    firstPermissionsRequestId = firstPermissionsRequest?.metadata.id || null;
  }
  ///: END:ONLY_INCLUDE_IN

  const originOfCurrentTab = getOriginOfCurrentTab(state);
  const shouldShowWeb3ShimUsageNotification =
    isPopup &&
    getWeb3ShimUsageAlertEnabledness(state) &&
    activeTabHasPermissions(state) &&
    getWeb3ShimUsageStateForOrigin(state, originOfCurrentTab) ===
      Web3ShimUsageAlertStates.recorded;

  const isSigningQRHardwareTransaction =
    hasUnsignedQRHardwareTransaction(state) ||
    hasUnsignedQRHardwareMessage(state);

  return {
    forgottenPassword,
    suggestedAssets,
    swapsEnabled,
    unconfirmedTransactionsCount: unconfirmedTransactionsCountSelector(state),
    shouldShowSeedPhraseReminder: getShouldShowSeedPhraseReminder(state),
    isPopup,
    isNotification,
    firstPermissionsRequestId,
    totalUnapprovedCount,
    connectedStatusPopoverHasBeenShown,
    defaultHomeActiveTabName,
    firstTimeFlowType,
    completedOnboarding,
    haveSwapsQuotes: Boolean(Object.values(swapsState.quotes || {}).length),
    swapsFetchParams: swapsState.fetchParams,
    showAwaitingSwapScreen: swapsState.routeState === 'awaiting',
    isMainnet: getIsMainnet(state),
    originOfCurrentTab,
    shouldShowWeb3ShimUsageNotification,
    pendingConfirmations,
    infuraBlocked: getInfuraBlocked(state),
    announcementsToShow: getSortedAnnouncementsToShow(state).length > 0,
    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    // errorsToShow: metamask.snapErrors,
    // shouldShowErrors: Object.entries(metamask.snapErrors || []).length > 0,
    ///: END:ONLY_INCLUDE_IN
    showWhatsNewPopup: getShowWhatsNewPopup(state),
    showRecoveryPhraseReminder: getShowRecoveryPhraseReminder(state),
    showOutdatedBrowserWarning:
      getIsBrowserDeprecated() && getShowOutdatedBrowserWarning(state),
    seedPhraseBackedUp,
    newNetworkAddedName: getNewNetworkAdded(state),
    isSigningQRHardwareTransaction,
    newNftAddedMessage: getNewNftAddedMessage(state),
    removeNftMessage: getRemoveNftMessage(state),
    newTokensImported: getNewTokensImported(state),
    newNetworkAddedConfigurationId: appState.newNetworkAddedConfigurationId,
    onboardedInThisUISession: appState.onboardedInThisUISession,
  };
};

const mapDispatchToProps = (dispatch) => ({
  closeNotificationPopup: () => closeNotificationPopup(),
  setConnectedStatusPopoverHasBeenShown: () =>
    dispatch(setConnectedStatusPopoverHasBeenShown()),
  onTabClick: (name) => dispatch(setDefaultHomeActiveTabName(name)),
  setWeb3ShimUsageAlertDismissed: (origin) =>
    setWeb3ShimUsageAlertDismissed(origin),
  disableWeb3ShimUsageAlert: () =>
    setAlertEnabledness(AlertTypes.web3ShimUsage, false),
  hideWhatsNewPopup: () => dispatch(hideWhatsNewPopup()),
  setRecoveryPhraseReminderHasBeenShown: () =>
    dispatch(setRecoveryPhraseReminderHasBeenShown()),
  setRecoveryPhraseReminderLastShown: (lastShown) =>
    dispatch(setRecoveryPhraseReminderLastShown(lastShown)),
  setNewNftAddedMessage: (message) => {
    dispatch(setRemoveNftMessage(''));
    dispatch(setNewNftAddedMessage(message));
  },
  setRemoveNftMessage: (message) => {
    dispatch(setNewNftAddedMessage(''));
    dispatch(setRemoveNftMessage(message));
  },
  setNewTokensImported: (newTokens) => {
    dispatch(setNewTokensImported(newTokens));
  },
  clearNewNetworkAdded: () => {
    dispatch(setNewNetworkAdded({}));
  },
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Home);
