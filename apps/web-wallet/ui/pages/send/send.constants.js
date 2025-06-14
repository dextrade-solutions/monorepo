import { MIN_GAS_LIMIT_HEX } from '../../../shared/constants/gas';
import { Numeric } from '../../../shared/modules/Numeric';
import { EtherDenomination } from '../../../shared/constants/common';

const MIN_GAS_PRICE_DEC = '0';
const MIN_GAS_PRICE_HEX = parseInt(MIN_GAS_PRICE_DEC, 10).toString(16);
const MIN_GAS_LIMIT_DEC = new Numeric('21000', 10);
const MAX_GAS_LIMIT_DEC = '7920027';

const HIGH_FEE_WARNING_MULTIPLIER = 1.5;
const MIN_GAS_PRICE_GWEI = new Numeric(
  MIN_GAS_PRICE_HEX,
  16,
  EtherDenomination.WEI,
)
  .toDenomination(EtherDenomination.GWEI)
  .round(1)
  .toPrefixedHexString();

const MIN_GAS_TOTAL = new Numeric(MIN_GAS_LIMIT_HEX, 16)
  .times(new Numeric(MIN_GAS_PRICE_HEX, 16, EtherDenomination.WEI))
  .toPrefixedHexString();

const TOKEN_TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';
const NFT_TRANSFER_FROM_FUNCTION_SIGNATURE = '0x23b872dd';

const INSUFFICIENT_FUNDS_ERROR = 'insufficientFunds';
const INSUFFICIENT_FUNDS_FOR_GAS_ERROR = 'insufficientFundsForGas';
const INSUFFICIENT_TOKENS_ERROR = 'insufficientTokens';
const NEGATIVE_ETH_ERROR = 'negativeETH';
const NEGATIVE_ASSET_ERROR = 'negativeAsset';
const INVALID_RECIPIENT_ADDRESS_ERROR = 'invalidAddressRecipient';
const INVALID_RECIPIENT_ADDRESS_NOT_ETH_NETWORK_ERROR =
  'invalidAddressRecipientNotEthNetwork';
const REQUIRED_ERROR = 'required';
const KNOWN_RECIPIENT_ADDRESS_WARNING = 'knownAddressRecipient';
const CONTRACT_ADDRESS_ERROR = 'contractAddressError';
const CONFUSING_ENS_ERROR = 'confusingEnsDomain';
const ENS_NO_ADDRESS_FOR_NAME = 'noAddressForName';
const ENS_NOT_FOUND_ON_NETWORK = 'ensNotFoundOnCurrentNetwork';
const ENS_NOT_SUPPORTED_ON_NETWORK = 'ensNotSupportedOnNetwork';
const ENS_ILLEGAL_CHARACTER = 'ensIllegalCharacter';
const ENS_UNKNOWN_ERROR = 'ensUnknownError';
const ENS_REGISTRATION_ERROR = 'ensRegistrationError';

const RECIPIENT_TYPES = {
  SMART_CONTRACT: 'SMART_CONTRACT',
  NON_CONTRACT: 'NON_CONTRACT',
};

export {
  MAX_GAS_LIMIT_DEC,
  HIGH_FEE_WARNING_MULTIPLIER,
  INSUFFICIENT_FUNDS_ERROR,
  INSUFFICIENT_FUNDS_FOR_GAS_ERROR,
  INSUFFICIENT_TOKENS_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  KNOWN_RECIPIENT_ADDRESS_WARNING,
  CONTRACT_ADDRESS_ERROR,
  INVALID_RECIPIENT_ADDRESS_NOT_ETH_NETWORK_ERROR,
  ENS_NO_ADDRESS_FOR_NAME,
  ENS_NOT_FOUND_ON_NETWORK,
  ENS_NOT_SUPPORTED_ON_NETWORK,
  ENS_ILLEGAL_CHARACTER,
  ENS_UNKNOWN_ERROR,
  ENS_REGISTRATION_ERROR,
  MIN_GAS_LIMIT_DEC,
  MIN_GAS_PRICE_DEC,
  MIN_GAS_PRICE_GWEI,
  MIN_GAS_PRICE_HEX,
  MIN_GAS_TOTAL,
  NEGATIVE_ETH_ERROR,
  NEGATIVE_ASSET_ERROR,
  REQUIRED_ERROR,
  CONFUSING_ENS_ERROR,
  TOKEN_TRANSFER_FUNCTION_SIGNATURE,
  NFT_TRANSFER_FROM_FUNCTION_SIGNATURE,
  RECIPIENT_TYPES,
};
