import { formatFundsAmount } from "../../ui/helpers/utils/util";

const _supportLink = 'https://t.me/dextrade_support';

export const SUPPORT_LINK = _supportLink;

export const COINGECKO_LINK = 'https://www.coingecko.com/';
export const CRYPTOCOMPARE_LINK = 'https://www.cryptocompare.com/';
export const PRIVACY_POLICY_LINK = 'https://consensys.net/privacy-policy/';

// TODO make sure these links are correct
export const ETHERSCAN_PRIVACY_LINK = 'https://etherscan.io/privacyPolicy';
export const CONSENSYS_PRIVACY_LINK = 'https://consensys.net/privacy-policy/';
export const AUTO_DETECT_TOKEN_LEARN_MORE_LINK =
  'https://consensys.net/privacy-policy/';

export const textChangeHandler = (event, currentValue) => {
  event.stopPropagation();
  // Automatically prefix value with 0. if user begins typing .
  const valueToUse = event.target.value === '.' ? '0.' : event.target.value;

  // Regex that validates strings with only numbers, 'x.', '.x', and 'x.x'
  const regexp = /^(\.\d+|\d+(\.\d+)?|\d+\.)$/u;
  // If the value is either empty or contains only numbers and '.' and only has one '.', update input to match
  if (valueToUse === '' || regexp.test(valueToUse)) {
    return valueToUse;
  }
  // otherwise, use the previously set inputValue (effectively denying the user from inputting the last char)
  // or an empty string if we do not yet have an inputValue
  return currentValue || '';
};

export const formatLongAmount = (v, ticker) => {
  try {
    return formatFundsAmount(v, ticker);
  } catch (e) {
    return null;
  }
};
