export const PRIMARY = 'PRIMARY';
export const SECONDARY = 'SECONDARY';

let _supportRequestLink = 'https://metamask.zendesk.com/hc/en-us';
const _contractAddressLink =
  'https://metamask.zendesk.com/hc/en-us/articles/360020028092-What-is-the-known-contract-address-warning-';

///: BEGIN:ONLY_INCLUDE_IN(flask)
_supportRequestLink =
  'https://metamask-flask.zendesk.com/hc/en-us/requests/new';
///: END:ONLY_INCLUDE_IN

///: BEGIN:ONLY_INCLUDE_IN(mmi)
_supportRequestLink = 'https://mmi-support.zendesk.com/hc/en-us/requests/new';
const _mmiWebSite = 'https://metamask.io/institutions/';
export const MMI_WEB_SITE = _mmiWebSite;
///: END:ONLY_INCLUDE_IN

export const SUPPORT_REQUEST_LINK = _supportRequestLink;
export const CONTRACT_ADDRESS_LINK = _contractAddressLink;
export const PASSWORD_MIN_LENGTH = 8;
export const OUTDATED_BROWSER_VERSIONS = {
  chrome: '<80',
  edge: '<80',
  firefox: '<78',
  opera: '<67',
};

const API_BASE_URL = {
  prod: 'https://api.dextrade.com',
  dev: 'https://dev-api.dextrade.com',
  stage: 'https://staging.dextrade.com',
};

export const DEXTRADE_BASE_URL = API_BASE_URL.prod;
export const DEXTRADE_HOST = DEXTRADE_BASE_URL.replace('https://', '');
