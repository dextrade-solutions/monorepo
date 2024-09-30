import { connect } from 'react-redux';

import {
  setPendingTokens,
  clearPendingTokens,
  getTokenStandardAndDetails,
  addToken,
  ignoreTokens,
} from '../../store/actions';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import {
  getRpcPrefsForCurrentProvider,
  getIsTokenDetectionSupported,
  getTokenDetectionSupportNetworkByChainId,
  getIsTokenDetectionInactiveOnMainnet,
  getIsDynamicTokenListAvailable,
  getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
  getTokenList,
  getActiveProviders,
  getActiveChains,
} from '../../selectors/selectors';
import ImportToken from './import-token.component';

const mapStateToProps = (state) => {
  const {
    metamask: {
      identities,
      tokens,
      pendingTokens,
      provider: { chainId },
      useTokenDetection,
      selectedAddress,
    },
  } = state;

  const isTokenDetectionInactiveOnMainnet =
    getIsTokenDetectionInactiveOnMainnet(state);
  const showSearchTab =
    getIsTokenDetectionSupported(state) ||
    isTokenDetectionInactiveOnMainnet ||
    Boolean(process.env.IN_TEST);

  return {
    identities,
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
    tokens,
    pendingTokens,
    showSearchTab,
    chainId,
    rpcPrefs: getRpcPrefsForCurrentProvider(state),
    tokenList: getTokenList(state),
    useTokenDetection,
    selectedAddress,
    usedNetworks: getActiveChains(state),
    isDynamicTokenListAvailable: getIsDynamicTokenListAvailable(state),
    networkName: getTokenDetectionSupportNetworkByChainId(state),
    tokenDetectionInactiveOnNonMainnetSupportedNetwork:
      getIstokenDetectionInactiveOnNonMainnetSupportedNetwork(state),
    activeProviders: getActiveProviders(state),
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setPendingTokens: (tokens) => dispatch(setPendingTokens(tokens)),
    addToken: (tokens) => dispatch(addToken(tokens)),
    ignoreTokens: (tokens) => dispatch(ignoreTokens(tokens)),
    clearPendingTokens: () => dispatch(clearPendingTokens()),
    getTokenStandardAndDetails: (localId, selectedAddress) =>
      getTokenStandardAndDetails(localId, selectedAddress, null),
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportToken);
