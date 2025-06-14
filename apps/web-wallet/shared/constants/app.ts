///: BEGIN:ONLY_INCLUDE_IN(flask)
// import { DialogType } from '@metamask/rpc-methods';
///: END:ONLY_INCLUDE_IN
import { RestrictedMethods } from './permissions';

/**
 * A string representing the type of environment the application is currently running in
 * popup - When the user click's the icon in their browser's extension bar; the default view
 * notification - When the extension opens due to interaction with a Web3 enabled website
 * fullscreen - When the user clicks 'expand view' to open the extension in a new tab
 * background - The background process that powers the extension
 */
export type EnvironmentType =
  | 'popup'
  | 'notification'
  | 'fullscreen'
  | 'background';
export const ENVIRONMENT_TYPE_POPUP = 'popup';
export const ENVIRONMENT_TYPE_NOTIFICATION = 'notification';
export const ENVIRONMENT_TYPE_FULLSCREEN = 'fullscreen';
export const ENVIRONMENT_TYPE_BACKGROUND = 'background';

/**
 * The distribution this build is intended for.
 *
 * This should be kept in-sync with the `BuildType` map in `development/build/utils.js`.
 */
export const BuildType = {
  beta: 'beta',
  desktop: 'desktop',
  flask: 'flask',
  main: 'main',
} as const;

export const PLATFORM_BRAVE = 'Brave';
export const PLATFORM_CHROME = 'Chrome';
export const PLATFORM_EDGE = 'Edge';
export const PLATFORM_FIREFOX = 'Firefox';
export const PLATFORM_OPERA = 'Opera';

export const MESSAGE_TYPE = {
  ADD_ETHEREUM_CHAIN: 'wallet_addEthereumChain',
  ETH_ACCOUNTS: RestrictedMethods.eth_accounts,
  ETH_DECRYPT: 'eth_decrypt',
  ETH_CHAIN_ID: 'eth_chainId',
  ETH_GET_ENCRYPTION_PUBLIC_KEY: 'eth_getEncryptionPublicKey',
  ETH_REQUEST_ACCOUNTS: 'eth_requestAccounts',
  ETH_SIGN: 'eth_sign',
  ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  GET_PROVIDER_STATE: 'metamask_getProviderState',
  LOG_WEB3_SHIM_USAGE: 'metamask_logWeb3ShimUsage',
  PERSONAL_SIGN: 'personal_sign',
  SEND_METADATA: 'metamask_sendDomainMetadata',
  SWITCH_ETHEREUM_CHAIN: 'wallet_switchEthereumChain',
  WALLET_REQUEST_PERMISSIONS: 'wallet_requestPermissions',
  WATCH_ASSET: 'wallet_watchAsset',
  WATCH_ASSET_LEGACY: 'metamask_watchAsset',
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  SNAP_DIALOG_ALERT: `${RestrictedMethods.snap_dialog}:alert`,
  SNAP_DIALOG_CONFIRMATION: `${RestrictedMethods.snap_dialog}:confirmation`,
  SNAP_DIALOG_PROMPT: `${RestrictedMethods.snap_dialog}:prompt`,
  ///: END:ONLY_INCLUDE_IN
  ///: BEGIN:ONLY_INCLUDE_IN(mmi)
  MMI_AUTHENTICATE: 'metamaskinstitutional_authenticate',
  MMI_REAUTHENTICATE: 'metamaskinstitutional_reauthenticate',
  MMI_REFRESH_TOKEN: 'metamaskinstitutional_refresh_token',
  MMI_SUPPORTED: 'metamaskinstitutional_supported',
  MMI_PORTFOLIO: 'metamaskinstitutional_portfolio',
  MMI_OPEN_SWAPS: 'metamaskinstitutional_open_swaps',
  MMI_CHECK_IF_TOKEN_IS_PRESENT: 'metamaskinstitutional_checkIfTokenIsPresent',
  MMI_SET_ACCOUNT_AND_NETWORK: 'metamaskinstitutional_setAccountAndNetwork',
  MMI_OPEN_ADD_HARDWARE_WALLET: 'metamaskinstitutional_openAddHardwareWallet',
  ///: END:ONLY_INCLUDE_IN
} as const;

///: BEGIN:ONLY_INCLUDE_IN(flask)
// export const SNAP_DIALOG_TYPES = {
//   [DialogType.Alert]: MESSAGE_TYPE.SNAP_DIALOG_ALERT,
//   [DialogType.Confirmation]: MESSAGE_TYPE.SNAP_DIALOG_CONFIRMATION,
//   [DialogType.Prompt]: MESSAGE_TYPE.SNAP_DIALOG_PROMPT,
// };
///: END:ONLY_INCLUDE_IN

/**
 * Custom messages to send and be received by the extension
 */
export const EXTENSION_MESSAGES = {
  CONNECTION_READY: 'CONNECTION_READY',
  READY: 'METAMASK_EXTENSION_READY',
} as const;

export const POLLING_TOKEN_ENVIRONMENT_TYPES = {
  [ENVIRONMENT_TYPE_POPUP]: 'popupGasPollTokens',
  [ENVIRONMENT_TYPE_NOTIFICATION]: 'notificationGasPollTokens',
  [ENVIRONMENT_TYPE_FULLSCREEN]: 'fullScreenGasPollTokens',
  [ENVIRONMENT_TYPE_BACKGROUND]: 'none',
} as const;

export const ORIGIN_METAMASK = 'dextrade';

export const METAMASK_BETA_CHROME_ID = 'pbbkamfgmaedccnfkmjcofcecjhfgldn';
export const METAMASK_PROD_CHROME_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';
export const METAMASK_FLASK_CHROME_ID = 'ljfoeinjpaedjfecbmggjgodbgkmjkjk';

export const METAMASK_MMI_BETA_CHROME_ID = 'kmbhbcbadohhhgdgihejcicbgcehoaeg';
export const METAMASK_MMI_PROD_CHROME_ID = 'ikkihjamdhfiojpdbnfllpjigpneipbc';

export const CHROME_BUILD_IDS = [
  METAMASK_BETA_CHROME_ID,
  METAMASK_PROD_CHROME_ID,
  METAMASK_FLASK_CHROME_ID,
  METAMASK_MMI_BETA_CHROME_ID,
  METAMASK_MMI_PROD_CHROME_ID,
] as const;

const METAMASK_BETA_FIREFOX_ID = 'webextension-beta@metamask.io';
const METAMASK_PROD_FIREFOX_ID = 'webextension@dextrade.io';
const METAMASK_FLASK_FIREFOX_ID = 'webextension-flask@metamask.io';

export const FIREFOX_BUILD_IDS = [
  METAMASK_BETA_FIREFOX_ID,
  METAMASK_PROD_FIREFOX_ID,
  METAMASK_FLASK_FIREFOX_ID,
] as const;

export const UNKNOWN_TICKER_SYMBOL = 'UNKNOWN';
