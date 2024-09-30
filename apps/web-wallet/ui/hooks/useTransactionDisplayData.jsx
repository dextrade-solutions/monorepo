import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getKnownMethodData } from '../selectors/selectors';
import {
  getStatusKey,
  getSubStatusKey,
  getTransactionTypeTitle,
} from '../helpers/utils/transactions.util';
import { camelCaseToCapitalize } from '../helpers/utils/common.util';
import { SECONDARY } from '../helpers/constants/common';
import {
  formatDateWithYearContext,
  shortenAddress,
  stripHttpSchemes,
} from '../helpers/utils/util';

import {
  PENDING_STATUS_HASH,
  TOKEN_CATEGORY_HASH,
} from '../helpers/constants/transactions';
import { getNfts } from '../ducks/metamask/metamask';
import {
  TransactionType,
  TransactionGroupCategory,
  TransactionStatus,
} from '../../shared/constants/transaction';
import { captureSingleException, getAssetModel } from '../store/actions';
import { isEqualCaseInsensitive } from '../../shared/modules/string-utils';
import { ICON_NAMES, Icon, Text } from '../components/component-library';
import {
  AlignItems,
  DISPLAY,
  IconColor,
  TextColor,
} from '../helpers/constants/design-system';
import Box from '../components/ui/box/box';
import { ExchangerType } from '../../shared/constants/exchanger';
import { formatLongAmount } from '../../shared/lib/ui-utils';
import { decimalToHex } from '../../shared/modules/conversion.utils';
import TransactionIcon from '../components/app/transaction-icon';
import TransactionIconP2p from '../components/app/transaction-icon-p2p';
import { useI18nContext } from './useI18nContext';
import { useUserPreferencedCurrency } from './useUserPreferencedCurrency';
import { useCurrencyDisplay } from './useCurrencyDisplay';
import { useAsset } from './useAsset';

/**
 *  There are seven types of transaction entries that are currently differentiated in the design:
 *  1. Signature request
 *  2. Send (sendEth sendTokens)
 *  3. Deposit
 *  4. Site interaction
 *  5. Approval
 *  6. Swap
 *  7. Swap Approval
 */
const signatureTypes = [
  null,
  undefined,
  TransactionType.sign,
  TransactionType.personalSign,
  TransactionType.signTypedData,
  TransactionType.ethDecrypt,
  TransactionType.ethGetEncryptionPublicKey,
];

/**
 * @typedef {(import('../../selectors/transactions').TransactionGroup} TransactionGroup
 */

/**
 * @typedef {object} TransactionDisplayData
 * @property {string} category - the transaction category that will be used for rendering the icon in the activity list
 * @property {string} primaryCurrency - the currency string to display in the primary position
 * @property {string} recipientAddress - the Ethereum address of the recipient
 * @property {string} senderAddress - the Ethereum address of the sender
 * @property {string} status - the status of the transaction
 * @property {string} subtitle - the supporting text describing the transaction
 * @property {boolean} subtitleContainsOrigin - true if the subtitle includes the origin of the tx
 * @property {string} title - the primary title of the tx that will be displayed in the activity list
 * @property {string} [secondaryCurrency] - the currency string to display in the secondary position
 */

/**
 * Get computed values used for displaying transaction data to a user
 *
 * The goal of this method is to perform all of the necessary computation and
 * state access required to take a transactionGroup and derive from it a shape
 * of data that can power all views related to a transaction. Presently the main
 * case is for shared logic between transaction-list-item and transaction-detail-view
 *
 * @param {TransactionGroup} transactionGroup - group of transactions of the same nonce
 * @returns {TransactionDisplayData}
 */
export function useTransactionDisplayData(transactionGroup) {
  // To determine which primary currency to display for swaps transactions we need to be aware
  // of which asset, if any, we are viewing at present
  const dispatch = useDispatch();
  const knownNfts = useSelector(getNfts);
  const t = useI18nContext();

  const { initialTransaction, primaryTransaction } = transactionGroup;

  // initialTransaction contains the data we need to derive the primary purpose of this transaction group
  const {
    type,
    otc,
    txParams = {},
    swapMetaData,
    exchangerType,
    source,
    destination,
    exchangerSettings,
  } = initialTransaction;
  const { from: senderAddress, to, localId } = txParams;

  const sendAsset = useAsset(localId || source);

  // for smart contract interactions, methodData can be used to derive the name of the action being taken
  const methodData =
    useSelector((state) => getKnownMethodData(state, txParams?.data)) || {};

  const displayedStatusKey = getStatusKey(primaryTransaction);
  const displayedSubStatusKey = getSubStatusKey(primaryTransaction);
  const isPending = displayedStatusKey in PENDING_STATUS_HASH;
  const isSubmitted = displayedStatusKey === TransactionStatus.submitted;
  const isUnapproved = displayedStatusKey === TransactionStatus.unapproved;
  const isP2P = [ExchangerType.P2PExchanger, ExchangerType.P2PClient].includes(
    exchangerType,
  );
  const isSwap = [TransactionType.atomicSwap, TransactionType.swap].includes(
    type,
  );

  let primaryValue = txParams?.value;
  const date = formatDateWithYearContext(initialTransaction.time);

  const recipientAddress = to;
  let icon;
  let subtitle = initialTransaction.origin;
  let subtitleContainsOrigin = false;
  let primaryPrefix = '-';
  let secondaryPrefix = '';

  // This value is used to determine whether we should look inside txParams.data
  // to pull out and render token related information
  const isTokenCategory = TOKEN_CATEGORY_HASH[type];
  // const isTokenCategory = Boolean(initialTransaction?.txParams?.data); // new implementation in dextrade
  // these values are always instantiated because they are either
  // used by or returned from hooks. Hooks must be called at the top level,
  // so as an additional safeguard against inappropriately associating token
  // transfers, we pass an additional argument to these hooks that will be
  // false for non-token transactions. This additional argument forces the
  // hook to return null
  let token = null;

  if (isTokenCategory && sendAsset.localId) {
    // token =
    //   knownTokens.find(({ address }) =>
    //     isEqualCaseInsensitive(address, recipientAddress),
    //   ) ||
    //   detectedTokens.find(({ address }) =>
    //     isEqualCaseInsensitive(address, recipientAddress),
    //   ) ||
    //   tokenList[recipientAddress.toLowerCase()];
    const { toAddress, tokenAmount, tokenId } =
      sendAsset.sharedProvider.parseTokenTransferData(
        initialTransaction?.txParams?.data,
      );
    token = {
      address: toAddress,
      id: tokenId,
      amount: tokenAmount,
      decimals: sendAsset.decimals,
      image: sendAsset.getIconUrl(),
      symbol: sendAsset.symbol,
    };
    primaryValue = decimalToHex(String(token.amount));
  }

  const nft =
    isTokenCategory &&
    knownNfts.find(
      ({ address, tokenId }) =>
        isEqualCaseInsensitive(address, recipientAddress) &&
        tokenId === token.id,
    );

  const origin = stripHttpSchemes(
    String(initialTransaction.origin) ||
      initialTransaction.msgParams?.origin ||
      '',
  );

  // used to append to the primary display value. initialized to either token.symbol or undefined
  // but can later be modified if dealing with a swap
  let secondarySuffix;
  let primarySuffix = isTokenCategory ? token?.symbol : undefined;
  // used to display the primary value of tx. initialized to either tokenDisplayValue or undefined
  // but can later be modified if dealing with a swap
  let primaryDisplayValue = isTokenCategory ? token?.amount : undefined;
  // used to display fiat amount of tx. initialized to either tokenFiatAmount or undefined
  // but can later be modified if dealing with a swap
  let secondaryDisplayValue = isTokenCategory ? token?.amount : undefined;

  let category;
  let title;

  let needApprove = isUnapproved;
  if (signatureTypes.includes(type)) {
    category = TransactionGroupCategory.signatureRequest;
    title = t('signatureRequest');
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (isSwap) {
    const fromAsset =
      source && dispatch(getAssetModel(initialTransaction.source));
    const toAsset =
      destination && dispatch(getAssetModel(initialTransaction.destination));
    icon = <TransactionIconP2p uid1={fromAsset.uid} uid2={toAsset.uid} />;
    category = TransactionGroupCategory.swap;
    subtitle = isP2P ? exchangerType : origin;
    if (
      exchangerType === ExchangerType.P2PExchanger &&
      exchangerSettings.statistic?.amountInCoinFrom
    ) {
      subtitle = (
        <>
          PNL{' '}
          <Box as="span" color={TextColor.successDefault}>
            {`+${formatLongAmount(
              exchangerSettings.statistic.amountInCoinFrom,
              toAsset.symbol,
            )}`}
          </Box>
        </>
      );
    }
    needApprove = isUnapproved && (fromAsset.isFiat || toAsset.isFiat);
    title = (
      <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
        <Text>{fromAsset.symbol}</Text>
        {fromAsset.standard && (
          <Box className="network-type-label" marginLeft={2}>
            {fromAsset.standard}
          </Box>
        )}
        <Icon
          name={ICON_NAMES.EXCHANGE_DIRECTION}
          color={IconColor.iconAlternative}
          marginLeft={2}
          marginRight={2}
        />
        <Text>{toAsset.symbol}</Text>
        {toAsset.standard && (
          <Box className="network-type-label" marginLeft={2}>
            {toAsset.standard}
          </Box>
        )}
      </Box>
    );
    primaryPrefix = '-';
    secondaryPrefix = '+';
    secondaryDisplayValue = formatLongAmount(swapMetaData.token_to_amount);
    secondarySuffix = toAsset.symbol;
    primaryDisplayValue = formatLongAmount(swapMetaData.token_from_amount);
    primarySuffix = fromAsset.symbol;
  } else if (type === TransactionType.swapApproval) {
    category = TransactionGroupCategory.approval;
    title = t('swapApproval', [primaryTransaction.sourceTokenSymbol]);
    subtitle = origin;
    subtitleContainsOrigin = true;
    primarySuffix = primaryTransaction.sourceTokenSymbol;
  } else if (type === TransactionType.tokenMethodApprove) {
    category = TransactionGroupCategory.approval;
    primaryPrefix = '';
    title = t('approveSpendingCap', [
      token?.symbol || t('token').toLowerCase(),
    ]);
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (type === TransactionType.tokenMethodSetApprovalForAll) {
    category = TransactionGroupCategory.approval;
    primaryPrefix = '';
    title = t('setApprovalForAllTitle', [token?.symbol || t('token')]);
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (type === TransactionType.contractInteraction) {
    category = TransactionGroupCategory.interaction;
    const transactionTypeTitle = getTransactionTypeTitle(t, type);
    title =
      (methodData?.name && camelCaseToCapitalize(methodData.name)) ||
      transactionTypeTitle;
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (type === TransactionType.deployContract) {
    // @todo Should perhaps be a separate group?
    category = TransactionGroupCategory.interaction;
    title = getTransactionTypeTitle(t, type);
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (type === TransactionType.incoming) {
    category = TransactionGroupCategory.receive;
    title = t('receive');
    primaryPrefix = '';
    subtitle = t('fromAddress', [shortenAddress(senderAddress)]);
  } else if (
    type === TransactionType.tokenMethodTransferFrom ||
    type === TransactionType.tokenMethodTransfer
  ) {
    category = TransactionGroupCategory.send;
    title = t('sendSpecifiedTokens', [
      token?.symbol || nft?.name || t('token'),
    ]);
    subtitle = t('toAddress', [shortenAddress(token?.address)]);
  } else if (type === TransactionType.tokenMethodSafeTransferFrom) {
    category = TransactionGroupCategory.send;
    title = t('safeTransferFrom');
    subtitle = t('toAddress', [shortenAddress(token?.address)]);
  } else if (type === TransactionType.simpleSend) {
    category = TransactionGroupCategory.send;
    title = t('send');
    subtitle = t('toAddress', [shortenAddress(recipientAddress)]);
  } else if (type === TransactionType.multisignerSimpleSend) {
    category = TransactionGroupCategory.send;
    title = t('multisignatureSend');
    subtitle = t('toAddress', [shortenAddress(recipientAddress)]);
  } else if (type === TransactionType.atomicSwapClaim) {
    category = TransactionGroupCategory.receive;
    subtitle = t('toAddress', [shortenAddress(recipientAddress)]);
    title = 'Claim';
  } else {
    dispatch(
      captureSingleException(
        `useTransactionDisplayData does not recognize transaction type. Type received is: ${type}`,
      ),
    );
  }

  const secondaryCurrencyPreferences = useUserPreferencedCurrency(SECONDARY);
  const [primaryCurrency] = useCurrencyDisplay(primaryValue, {
    prefix: secondaryPrefix,
    suffix: secondarySuffix || ' ',
    displayValue: isSwap && secondaryDisplayValue,
    ticker: sendAsset.symbol,
    shiftBy: sendAsset.decimals,
    ...secondaryCurrencyPreferences,
  });

  const [secondaryCurrency] = useCurrencyDisplay(primaryValue, {
    prefix: primaryPrefix,
    suffix: primarySuffix,
    displayValue: isSwap && primaryDisplayValue,
    ticker: sendAsset.symbol,
    shiftBy: sendAsset.decimals,
  });

  icon = icon || (
    <TransactionIcon category={category} status={displayedStatusKey} />
  );
  title = (
    <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
      <Text>{title}</Text>
      {sendAsset.standard && (
        <Box className="network-type-label" marginLeft={2}>
          {sendAsset.standard}
        </Box>
      )}
    </Box>
  );

  return {
    title,
    category,
    date,
    subtitle,
    subtitleContainsOrigin,
    primaryCurrency,
    senderAddress,
    recipientAddress,
    secondaryCurrency,
    displayedStatusKey,
    displayedSubStatusKey,
    isPending,
    isSubmitted,
    isSwap,
    otc,
    icon,
    needApprove,
  };
}
