import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getTokenTrackerLink } from '@metamask/etherscan-link';
import ZENDESK_URLS from '../../helpers/constants/zendesk-url';
import {
  checkExistingAddresses,
  getURLHostName,
} from '../../helpers/utils/util';
import { getTokenMetadata } from '../../helpers/utils/token-util';
import { CONFIRM_IMPORT_TOKEN_ROUTE } from '../../helpers/constants/routes';
import TextField from '../../components/ui/text-field';
import PageContainer from '../../components/ui/page-container';
import { Tabs, Tab } from '../../components/ui/tabs';
import ActionableMessage from '../../components/ui/actionable-message/actionable-message';
import Typography from '../../components/ui/typography';
import {
  TypographyVariant,
  FONT_WEIGHT,
  DISPLAY,
  AlignItems,
} from '../../helpers/constants/design-system';
import Button from '../../components/ui/button';
import Box from '../../components/ui/box';
import Identicon from '../../components/ui/identicon';
import UrlIcon from '../../components/ui/url-icon';
import { CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP } from '../../../shared/constants/network';
import { Text } from '../../components/component-library';
import ListItem from '../../components/ui/list-item';
import TokenList from './token-list';
import TokenSearch from './token-search';

const emptyAddr = '0x0000000000000000000000000000000000000000';

const MIN_DECIMAL_VALUE = 0;
const MAX_DECIMAL_VALUE = 36;

class ImportToken extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    /**
     * History object of the router.
     */
    history: PropTypes.object,

    /**
     * Set the state of `pendingTokens`, called when adding a token.
     */
    setPendingTokens: PropTypes.func,

    /**
     * The current list of pending tokens to be added.
     */
    pendingTokens: PropTypes.object,

    /**
     * Clear the list of pending tokens. Called when closing the modal.
     */
    clearPendingTokens: PropTypes.func,

    tokens: PropTypes.array,

    activeProviders: PropTypes.array,

    /**
     * The identities/accounts that are currently added to the wallet.
     */
    identities: PropTypes.object,

    /**
     * Boolean flag that shows/hides the search tab.
     */
    showSearchTab: PropTypes.bool.isRequired,

    /**
     * The most recent overview page route, which is 'navigated' to when closing the modal.
     */
    mostRecentOverviewPage: PropTypes.string.isRequired,

    /**
     * The active chainId in use.
     */
    chainId: PropTypes.string,

    /**
     * The rpc preferences to use for the current provider.
     */
    rpcPrefs: PropTypes.object,

    /**
     * The list of tokens available for search.
     */
    tokenList: PropTypes.object,

    /**
     * Function called to fetch information about the token standard and
     * details, see `actions.js`.
     */
    getTokenStandardAndDetails: PropTypes.func,

    dispatch: PropTypes.func,

    /**
     * The currently selected active address.
     */
    selectedAddress: PropTypes.string,
    usedNetworks: PropTypes.object,
    isDynamicTokenListAvailable: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    tokenList: {},
  };

  state = {
    customAddress: '',
    customSymbol: '',
    customDecimals: 0,
    searchResults: [],
    selectedTokens: {},
    tokenSelectorError: null,
    customAddressError: null,
    customSymbolError: null,
    customDecimalsError: null,
    nftAddressError: null,
    forceEditSymbol: false,
    symbolAutoFilled: false,
    decimalAutoFilled: false,
    mainnetTokenWarning: null,
    validProviders: [],
    selectedProvider: null,
  };

  componentDidMount() {
    const { pendingTokens } = this.props;
    const pendingTokenKeys = Object.keys(pendingTokens || {});

    if (pendingTokenKeys.length > 0) {
      let selectedTokens = {};
      let customToken = {};

      pendingTokenKeys.forEach((tokenAddress) => {
        const token = pendingTokens[tokenAddress];
        const { isCustom } = token;

        if (isCustom) {
          customToken = { ...token };
        } else {
          selectedTokens = { ...selectedTokens, [tokenAddress]: { ...token } };
        }
      });

      const {
        address: customAddress = '',
        symbol: customSymbol = '',
        decimals: customDecimals = 0,
      } = customToken;

      this.setState({
        selectedTokens,
        customAddress,
        customSymbol,
        customDecimals,
      });
    }
  }

  handleToggleToken(token) {
    const tokenAlreadyAdded = token.isExistInWallet;
    const { dispatch } = this.props;

    if (tokenAlreadyAdded) {
      return dispatch(token.removeFromWallet.bind(token));
    }

    return dispatch(token.addToWallet.bind(token));
  }

  hasError() {
    const {
      tokenSelectorError,
      customAddressError,
      customSymbolError,
      customDecimalsError,
      nftAddressError,
    } = this.state;

    return (
      tokenSelectorError ||
      customAddressError ||
      customSymbolError ||
      customDecimalsError ||
      nftAddressError
    );
  }

  hasSelected() {
    const { customAddress = '', selectedTokens = {} } = this.state;
    return customAddress || Object.keys(selectedTokens).length > 0;
  }

  handleNext() {
    if (this.hasError()) {
      return;
    }

    if (!this.hasSelected()) {
      this.setState({ tokenSelectorError: this.context.t('mustSelectOne') });
      return;
    }

    const { setPendingTokens, history, tokenList } = this.props;
    const {
      customAddress: address,
      customSymbol: symbol,
      customDecimals: decimals,
      selectedTokens,
      selectedProvider,
    } = this.state;

    const localId = `${selectedProvider.config.chainId}:${address}`;

    let customToken = {
      localId,
      name: symbol,
      symbol,
      decimals,
      uid: null,
      network: selectedProvider.config.network,
      standard: selectedProvider.getStandard(),
    };
    if (tokenList[localId]) {
      customToken = tokenList[localId];
    }
    customToken.account =
      this.props.usedNetworks[selectedProvider.config.chainId].accounts[
        this.props.selectedAddress
      ]?.nativeAddress;
    customToken.decimals = customToken.decimals || 0;

    setPendingTokens({ customToken, selectedTokens }).then(() => {
      history.push(CONFIRM_IMPORT_TOKEN_ROUTE);
    });
  }

  async attemptToAutoFillTokenParams(localId) {
    const { tokenList } = this.props;
    let { symbol = '', decimals } = getTokenMetadata(localId, tokenList) || {};

    if (!symbol) {
      try {
        const tokenInfo = await this.props.getTokenStandardAndDetails(localId);
        symbol = tokenInfo.symbol;
        decimals = tokenInfo.decimals;
      } catch (e) {
        // ignore
      }
    }

    const symbolAutoFilled = Boolean(symbol);
    const decimalAutoFilled = Boolean(decimals);
    this.setState({ symbolAutoFilled, decimalAutoFilled });
    this.handleCustomSymbolChange(symbol || '');
    this.handleCustomDecimalsChange(String(decimals));
  }

  async handleCustomAddressChange(value) {
    const customAddress = value.trim();
    this.setState({
      customAddress,
      customAddressError: null,
      nftAddressError: null,
      tokenSelectorError: null,
      symbolAutoFilled: false,
      decimalAutoFilled: false,
      mainnetTokenWarning: null,
      showSymbolAndDecimals: false,
      validProviders: [],
      selectedProvider: null,
    });

    const validProviders = this.props.activeProviders.filter((provider) =>
      provider.isAddress(customAddress),
    );

    // const addressIsValid = isValidHexAddress(customAddress, {
    //   allowNonPrefixed: false,
    // });
    // const standardAddress = addHexPrefix(customAddress).toLowerCase();

    // const isMainnetToken = Object.keys(STATIC_MAINNET_TOKEN_LIST).some(
    //   (key) => key.toLowerCase() === customAddress.toLowerCase(),
    // );

    // const isMainnetNetwork = this.props.chainId === '0x1';

    // let standard;
    // if (addressIsValid) {
    //   try {
    //     ({ standard } = await this.props.getTokenStandardAndDetails(
    //       standardAddress,
    //       this.props.selectedAddress,
    //     ));
    //   } catch (error) {
    //     // ignore
    //   }
    // }

    const addressIsEmpty =
      customAddress.length === 0 || customAddress === emptyAddr;

    switch (true) {
      case !validProviders.length && !addressIsEmpty:
        this.setState({
          customAddressError: this.context.t('invalidAddress'),
          customSymbol: '',
          customDecimals: 0,
          customSymbolError: null,
          customDecimalsError: null,
          showSymbolAndDecimals: false,
        });

        break;
      // case standard === 'ERC1155' || standard === 'ERC721':
      //   this.setState({
      //     nftAddressError: this.context.t('nftAddressError', [
      //       <a
      //         className="import-token__nft-address-error-link"
      //         onClick={() =>
      //           this.props.history.push({
      //             pathname: ADD_NFT_ROUTE,
      //             state: {
      //               addressEnteredOnImportTokensPage: this.state.customAddress,
      //             },
      //           })
      //         }
      //         key="nftAddressError"
      //       >
      //         {this.context.t('importNFTPage')}
      //       </a>,
      //     ]),
      //   });

      //   break;
      case Boolean(this.props.identities[customAddress]):
        this.setState({
          customAddressError: this.context.t('personalAddressDetected'),
          showSymbolAndDecimals: false,
          validProviders: [],
        });

        break;
      default:
        if (!addressIsEmpty) {
          if (validProviders.length === 1) {
            const [provider] = validProviders;
            this.handleProviderChange(provider, customAddress);
          } else {
            this.setState({
              validProviders,
            });
          }
        }
    }
  }

  handleProviderChange(provider, customAddress) {
    const localId = `${provider.config.chainId}:${customAddress}`;
    if (checkExistingAddresses(localId, this.props.tokens)) {
      this.setState({
        customAddressError: this.context.t('tokenAlreadyAdded'),
        showSymbolAndDecimals: false,
        selectedProvider: null,
      });
    } else {
      this.setState({
        customAddressError: null,
        showSymbolAndDecimals: true,
        validProviders: [],
        selectedProvider: provider,
      });
      this.attemptToAutoFillTokenParams(localId);
    }
  }

  handleCustomSymbolChange(value) {
    const customSymbol = value.trim();
    const symbolLength = customSymbol.length;
    let customSymbolError = null;

    if (symbolLength <= 0 || symbolLength >= 12) {
      customSymbolError = this.context.t('symbolBetweenZeroTwelve');
    }

    this.setState({ customSymbol, customSymbolError });
  }

  handleCustomDecimalsChange(value) {
    let customDecimals;
    let customDecimalsError = null;

    if (value) {
      customDecimals = Number(value.trim());
      customDecimalsError =
        value < MIN_DECIMAL_VALUE || value > MAX_DECIMAL_VALUE
          ? this.context.t('decimalsMustZerotoTen')
          : null;
    } else {
      customDecimals = '';
      customDecimalsError = this.context.t('tokenDecimalFetchFailed');
    }

    this.setState({ customDecimals, customDecimalsError });
  }

  renderProviderIcon(provider) {
    return provider.chainId in CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP ? (
      <Identicon
        className="networks-tab__content__custom-image"
        diameter={24}
        image={CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP[provider.config.chainId]}
        imageBorder
      />
    ) : (
      <UrlIcon
        className="networks-tab__content__icon-with-fallback"
        fallbackClassName="networks-tab__content__icon-with-fallback"
        name={provider.config.nickname}
      />
    );
  }

  renderCustomTokenForm() {
    const { t } = this.context;
    const {
      customAddress,
      customSymbol,
      customDecimals,
      customAddressError,
      customSymbolError,
      customDecimalsError,
      forceEditSymbol,
      symbolAutoFilled,
      decimalAutoFilled,
      mainnetTokenWarning,
      nftAddressError,
      showSymbolAndDecimals,
      validProviders,
      selectedProvider,
    } = this.state;

    const { chainId, rpcPrefs, isDynamicTokenListAvailable } = this.props;
    const blockExplorerTokenLink = getTokenTrackerLink(
      customAddress,
      chainId,
      null,
      null,
      { blockExplorerUrl: rpcPrefs?.blockExplorerUrl ?? null },
    );
    const blockExplorerLabel = rpcPrefs?.blockExplorerUrl
      ? getURLHostName(blockExplorerTokenLink)
      : t('etherscan');

    return (
      <div className="import-token__custom-token-form">
        <ActionableMessage
          type={isDynamicTokenListAvailable ? 'warning' : 'default'}
          message={t(
            isDynamicTokenListAvailable
              ? 'customTokenWarningInTokenDetectionNetwork'
              : 'customTokenWarningInNonTokenDetectionNetwork',
            [
              <Button
                type="link"
                key="import-token-fake-token-warning"
                className="import-token__link"
                rel="noopener noreferrer"
                target="_blank"
                href={ZENDESK_URLS.TOKEN_SAFETY_PRACTICES}
              >
                {t('learnScamRisk')}
              </Button>,
            ],
          )}
          withRightButton
          useIcon
          iconFillColor={
            isDynamicTokenListAvailable
              ? 'var(--color-warning-default)'
              : 'var(--color-info-default)'
          }
        />
        <TextField
          id="custom-address"
          label={t('tokenContractAddress')}
          type="text"
          value={customAddress}
          onChange={(e) => this.handleCustomAddressChange(e.target.value)}
          error={customAddressError || mainnetTokenWarning || nftAddressError}
          fullWidth
          autoFocus
          margin="normal"
        />
        {Boolean(validProviders.length) && (
          <Box className="import-token__select-chain">
            <Text marginBottom={4}>Select the chain</Text>
            {validProviders.map((provider) => (
              <ListItem
                key={provider.config.chainId}
                className="import-token__select-chain__list-item"
                title={provider.config.nickname}
                icon={this.renderProviderIcon(provider)}
                onClick={() =>
                  this.handleProviderChange(provider, this.state.customAddress)
                }
              />
            ))}
          </Box>
        )}
        {Boolean(selectedProvider) && (
          <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
            {this.renderProviderIcon(selectedProvider)}
            <Text marginLeft={2}>{selectedProvider.config.nickname}</Text>
          </Box>
        )}
        {showSymbolAndDecimals && (
          <>
            <TextField
              id="custom-symbol"
              label={
                <div className="import-token__custom-symbol__label-wrapper">
                  <span className="import-token__custom-symbol__label">
                    {t('tokenSymbol')}
                  </span>
                  {symbolAutoFilled && !forceEditSymbol && (
                    <div
                      className="import-token__custom-symbol__edit"
                      onClick={() => this.setState({ forceEditSymbol: true })}
                    >
                      {t('edit')}
                    </div>
                  )}
                </div>
              }
              type="text"
              value={customSymbol}
              onChange={(e) => this.handleCustomSymbolChange(e.target.value)}
              error={customSymbolError}
              fullWidth
              margin="normal"
              disabled={symbolAutoFilled && !forceEditSymbol}
            />
            <TextField
              id="custom-decimals"
              label={t('decimal')}
              type="number"
              value={customDecimals}
              onChange={(e) => this.handleCustomDecimalsChange(e.target.value)}
              error={customDecimals ? customDecimalsError : null}
              fullWidth
              margin="normal"
              disabled={decimalAutoFilled}
              min={MIN_DECIMAL_VALUE}
              max={MAX_DECIMAL_VALUE}
            />
            {customDecimals === '' && (
              <ActionableMessage
                message={
                  <>
                    <Typography
                      variant={TypographyVariant.H7}
                      fontWeight={FONT_WEIGHT.BOLD}
                    >
                      {t('tokenDecimalFetchFailed')}
                    </Typography>
                    <Typography
                      variant={TypographyVariant.H7}
                      fontWeight={FONT_WEIGHT.NORMAL}
                    >
                      {t('verifyThisTokenDecimalOn', [
                        <Button
                          type="link"
                          key="import-token-verify-token-decimal"
                          className="import-token__link"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={blockExplorerTokenLink}
                        >
                          {blockExplorerLabel}
                        </Button>,
                      ])}
                    </Typography>
                  </>
                }
                type="warning"
                withRightButton
                className="import-token__decimal-warning"
              />
            )}
          </>
        )}
      </div>
    );
  }

  renderSearchToken() {
    const { tokenList } = this.props;
    const { tokenSelectorError, selectedTokens, searchResults } = this.state;
    return (
      <div className="import-token__search-token">
        <TokenSearch
          onSearch={({ results = [] }) =>
            this.setState({ searchResults: results })
          }
          error={tokenSelectorError}
          tokenList={tokenList}
        />
        <div className="import-token__token-list">
          <TokenList
            results={searchResults}
            selectedTokens={selectedTokens}
            onToggleToken={(token) => this.handleToggleToken(token)}
          />
        </div>
      </div>
    );
  }

  renderTabs() {
    const { t } = this.context;
    const { showSearchTab } = this.props;
    const tabs = [];

    if (showSearchTab) {
      tabs.push(
        <Tab
          name={t('search')}
          key="search-tab"
          className="tabs--autogrow"
          tabKey="search"
        >
          {this.renderSearchToken()}
        </Tab>,
      );
    }
    tabs.push(
      <Tab name={t('customToken')} key="custom-tab" tabKey="customToken">
        {this.renderCustomTokenForm()}
      </Tab>,
    );

    return <Tabs>{tabs}</Tabs>;
  }

  render() {
    const { history, clearPendingTokens, mostRecentOverviewPage } = this.props;
    const { selectedProvider, customAddress } = this.state;

    return (
      <PageContainer
        title={this.context.t('importTokensCamelCase')}
        tabsComponent={this.renderTabs()}
        onSubmit={() => this.handleNext()}
        hideCancel
        hideFooter={!customAddress || !selectedProvider}
        disabled={Boolean(this.hasError())}
        onTabClick={() => {
          this.handleCustomAddressChange('');
        }}
        onClose={() => {
          clearPendingTokens();
          history.push(mostRecentOverviewPage);
        }}
      />
    );
  }
}

export default ImportToken;
