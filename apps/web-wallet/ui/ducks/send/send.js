import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addHexPrefix } from 'ethereumjs-util';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { EtherDenomination } from '../../../shared/constants/common';
import { GAS_LIMITS, GasEstimateTypes } from '../../../shared/constants/gas';
import { CHAIN_IDS } from '../../../shared/constants/network';

import {
  AssetType,
  TokenStandard,
  TransactionEnvelopeType,
  TransactionType,
} from '../../../shared/constants/transaction';
import { getTokenValueParam } from '../../../shared/lib/metamask-controller-utils';

import { calcGasTotal } from '../../../shared/lib/transactions-controller-utils';
import {
  decimalToHex,
  getValueFromWeiHex,
} from '../../../shared/modules/conversion.utils';
import { toChecksumHexAddress } from '../../../shared/modules/hexstring-utils';
import { Numeric } from '../../../shared/modules/Numeric';
import { parseStandardTokenTransactionData } from '../../../shared/modules/transaction.utils';
import { INVALID_ASSET_TYPE } from '../../helpers/constants/error-keys';
import fetchEstimatedL1Fee from '../../helpers/utils/optimism/fetchEstimatedL1Fee';
import { getTokenAddressParam } from '../../helpers/utils/token-util';
import { isOriginContractAddress } from '../../helpers/utils/util';
import {
  CONTRACT_ADDRESS_ERROR,
  INSUFFICIENT_FUNDS_ERROR,
  INSUFFICIENT_TOKENS_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  KNOWN_RECIPIENT_ADDRESS_WARNING,
  NEGATIVE_ASSET_ERROR,
  RECIPIENT_TYPES,
} from '../../pages/send/send.constants';

import {
  isBalanceSufficient,
  isTokenBalanceSufficient,
} from '../../pages/send/send.utils';
import {
  getAddressBookEntryOrAccountName,
  getAdvancedInlineGasShown,
  getCurrentChainId,
  getEnsResolutionByAddress,
  getGasPriceInHexWei,
  getIsMultiLayerFeeNetwork,
  getSelectedAddress,
  getTargetAccount,
  getTokenList,
  getUseTokenDetection,
} from '../../selectors';
import {
  ACCOUNT_CHANGED,
  ADDRESS_BOOK_UPDATED,
  GAS_FEE_ESTIMATES_UPDATED,
  QR_CODE_DETECTED,
  SELECTED_ACCOUNT_CHANGED,
} from '../../store/actionConstants';
import {
  addPollingTokenToAppState,
  addUnapprovedTransactionAndRouteToConfirmationPage,
  disconnectGasFeeEstimatePoller,
  displayWarning,
  getGasFeeEstimatesAndStartPolling,
  hideLoadingIndication,
  isNftOwner,
  multisignTransactionCreate,
  multisignTransactionWeight,
  removePollingTokenFromAppState,
  showLoadingIndication,
  showModal,
  updateEditableParams,
  updateTransactionGasFees,
  updateTransactionSendFlowHistory,
} from '../../store/actions';

import { resetDomainResolution } from '../domains';
import { setCustomGasLimit } from '../gas/gas.duck';
import {
  getGasEstimateType,
  getTokens,
  getUnapprovedTxs,
} from '../metamask/metamask';
import { AssetModel } from '../../../shared/lib/asset-model';
import { getSharedProvider } from '../../../shared/shared-chain-provider';
import {
  estimateGasLimitForSend,
  generateTransactionParams,
  getRoundedGasPrice,
} from './helpers';
// typedef import statements
/**
 * @typedef {(
 *  import('immer/dist/internal').WritableDraft<SendState>
 * )} SendStateDraft
 * @typedef {(
 *  import( '../../helpers/constants/common').TokenStandardStrings
 * )} TokenStandardStrings
 * @typedef {(
 *  import( '../../../shared/constants/tokens').TokenDetails
 * )} TokenDetails
 * @typedef {(
 *  import('@metamask/gas-fee-controller').LegacyGasPriceEstimate
 * )} LegacyGasPriceEstimate
 * @typedef {(
 *  import('@metamask/gas-fee-controller').GasFeeEstimates
 * )} GasFeeEstimates
 * @typedef {(
 *  import('@metamask/gas-fee-controller').EthGasPriceEstimate
 * )} EthGasPriceEstimate
 * @typedef {(
 *  import('@metamask/gas-fee-controller').GasEstimateType
 * )} GasEstimateType
 * @typedef {(
 *  import('redux').AnyAction
 * )} AnyAction
 */

/**
 * @template R - Return type of the async function
 * @typedef {(
 *  import('redux-thunk').ThunkAction<R, MetaMaskState, unknown, AnyAction>
 * )} ThunkAction<R>
 */

/**
 * This type will take a typical constant string mapped object and turn it into
 * a union type of the values.
 *
 * @template O - The object to make strings out of
 * @typedef {O[keyof O]} MapValuesToUnion<O>
 */

/**
 * @typedef {object} SendStateStages
 * @property {'ADD_RECIPIENT'} ADD_RECIPIENT - The user is selecting which
 *  address to send an asset to.
 * @property {'DRAFT'} DRAFT - The send form is shown for a transaction yet to
 *  be sent to the Transaction Controller.
 * @property {'EDIT'} EDIT - The send form is shown for a transaction already
 *  submitted to the Transaction Controller but not yet confirmed. This happens
 *  when a confirmation is shown for a transaction and the 'edit' button in the
 *  header is clicked.
 * @property {'INACTIVE'} INACTIVE - The send state is idle, and hasn't yet
 *  fetched required data for gasPrice and gasLimit estimations, etc.
 */

/**
 * The Stages that the send slice can be in
 *
 * @type {SendStateStages}
 */
export const SEND_STAGES = {
  ADD_RECIPIENT: 'ADD_RECIPIENT',
  DRAFT: 'DRAFT',
  EDIT: 'EDIT',
  INACTIVE: 'INACTIVE',
};

/**
 * @typedef {object} DraftTxStatus
 * @property {'INVALID'} INVALID - The transaction is invalid and cannot be
 *  submitted. There are a number of cases that would result in an invalid
 *  send state:
 *  1. The recipient is not yet defined
 *  2. The amount + gasTotal is greater than the user's balance when sending
 *     native currency
 *  3. The gasTotal is greater than the user's *native* balance
 *  4. The amount of sent asset is greater than the user's *asset* balance
 *  5. Gas price estimates failed to load entirely
 *  6. The gasLimit is less than 21000 (0x5208)
 * @property {'VALID'} VALID - The transaction is valid and can be submitted.
 */

/**
 * The status of the send slice
 *
 * @type {DraftTxStatus}
 */
export const SEND_STATUSES = {
  INVALID: 'INVALID',
  VALID: 'VALID',
};

/**
 * @typedef {object} SendStateGasModes
 * @property {'BASIC'} BASIC - Shows the basic estimate slow/avg/fast buttons
 *  when on mainnet and the metaswaps API request is successful.
 * @property {'CUSTOM'} CUSTOM - Shows GasFeeDisplay component that is a read
 *  only display of the values the user has set in the advanced gas modal
 *  (stored in the gas duck under the customData key).
 * @property {'INLINE'} INLINE - Shows inline gasLimit/gasPrice fields when on
 *  any other network or metaswaps API fails and we use eth_gasPrice.
 */

/**
 * Controls what is displayed in the send-gas-row component.
 *
 * @type {SendStateGasModes}
 */
export const GAS_INPUT_MODES = {
  BASIC: 'BASIC',
  CUSTOM: 'CUSTOM',
  INLINE: 'INLINE',
};

/**
 * @typedef {object} SendStateAmountModes
 * @property {'INPUT'} INPUT - the user provides the amount by typing in the
 *  field.
 * @property {'MAX'} MAX - The user selects the MAX button and amount is
 *  calculated based on balance - (amount + gasTotal).
 */

/**
 * The modes that the amount field can be set by
 *
 * @type {SendStateAmountModes}
 */
export const AMOUNT_MODES = {
  INPUT: 'INPUT',
  MAX: 'MAX',
};

/**
 * @typedef {object} SendStateRecipientModes
 * @property {'CONTACT_LIST'} CONTACT_LIST - The user is displayed a list of
 *  their contacts and addresses they have recently send to.
 * @property {'MY_ACCOUNTS'} MY_ACCOUNTS - the user is displayed a list of
 *  their own accounts to send to.
 */

/**
 * The type of recipient list that is displayed to user
 *
 * @type {SendStateRecipientModes}
 */
export const RECIPIENT_SEARCH_MODES = {
  CONTACT_LIST: 'CONTACT_LIST',
  MY_ACCOUNTS: 'MY_ACCOUNTS',
};

/**
 * @typedef {object} Account
 * @property {string} address - The hex address of the account.
 * @property {string} balance - Hex string representing the native asset
 *  balance of the account the transaction will be sent from.
 */

/**
 * @typedef {object} Amount
 * @property {string} [error] - Error to display for the amount field.
 * @property {string} value - A hex string representing the amount of the
 *  selected currency to send.
 */

/**
 * @typedef {object} Asset
 * @property {string} balance - A hex string representing the balance
 *  that the user holds of the asset that they are attempting to send.
 * @property {TokenDetails} [details] - An object that describes the
 *  selected asset in the case that the user is sending a token or collectibe.
 *  Will be null when asset.type is 'NATIVE'.
 * @property {string} [error] - Error to display when there is an issue
 *  with the asset.
 * @property {AssetType} type - The type of asset that the user
 *  is attempting to send. Defaults to 'NATIVE' which represents the native
 *  asset of the chain. Can also be 'TOKEN' or 'NFT'.
 */

/**
 * @typedef {object} GasFees
 * @property {string} [error] - error to display for gas fields.
 * @property {string} gasLimit - maximum gas needed for tx.
 * @property {string} gasPrice - price in wei to pay per gas.
 * @property {string} gasTotal - maximum total price in wei to pay.
 * @property {string} maxFeePerGas - Maximum price in wei to pay per gas.
 * @property {string} maxPriorityFeePerGas - Maximum priority fee in wei to pay
 *  per gas.
 */

/**
 * An object that describes the intended recipient of a transaction.
 *
 * @typedef {object} Recipient
 * @property {string} address - The fully qualified address of the recipient.
 *  This is set after the recipient.userInput is validated, the userInput field
 *  is quickly updated to avoid delay between keystrokes and seeing the input
 *  field updated. After a debounce the address typed is validated and then the
 *  address field is updated. The address field is also set when the user
 *  selects a contact or account from the list, or an ENS resolution when
 *  typing ENS names.
 * @property {string} [error] - Error to display on the address field.
 * @property {string} nickname - The nickname that the user has added to their
 *  address book for the recipient.address.
 * @property {string} [warning] - Warning to display on the address field.
 */

/**
 * @typedef {object} DraftTransaction
 * @property {Amount} amount - An object containing information about the
 *  amount of currency to send.
 * @property {Asset} asset - An object that describes the asset that the user
 *  has selected to send.
 * @property {Account} [fromAccount] - The send flow is usually only relative to
 *  the currently selected account. When editing a transaction, however, the
 *  account may differ. In that case, the details of that account will be
 *  stored in this object within the draftTransaction.
 * @property {GasFees} gas - Details about the current gas settings
 * @property {Array<{event: string, timestamp: number}>} history - An array of
 *  entries that describe the user's journey through the send flow. This is
 *  sent to the controller for attaching to state logs for troubleshooting and
 *  support.
 * @property {string} [id] - If the transaction has already been added to the
 *  TransactionController this field will be populated with its id from the
 *  TransactionController state. This is required to be able to update the
 *  transaction in the controller.
 * @property {Recipient} recipient - An object that describes the intended
 *  recipient of the transaction.
 * @property {MapValuesToUnion<DraftTxStatus>} status - Describes the
 *  validity of the draft transaction, which will be either 'VALID' or
 *  'INVALID', depending on our ability to generate a valid txParams object for
 *  submission.
 * @property {string} transactionType - Determines type of transaction being
 *  sent, defaulted to 0x0 (legacy).
 * @property {string} [userInputHexData] - When a user has enabled custom hex
 *  data field in advanced options, they can supply data to the field which is
 *  stored under this key.
 */

/**
 * @type {DraftTransaction}
 */
export const draftTransactionInitialState = {
  amount: {
    error: null,
    value: '0x0',
  },
  asset: {
    balance: '0x0',
    localId: null,
    error: null,
    type: AssetType.native,
  },
  fromAccount: null,
  gas: {
    error: null,
    gasLimit: '0x0',
    gasPrice: '0x0',
    gasTotal: '0x0',
    maxFeePerGas: '0x0',
    maxPriorityFeePerGas: '0x0',
    wasManuallyEdited: false,
  },
  history: [],
  id: null,
  recipient: {
    address: '',
    error: null,
    nickname: '',
    warning: null,
    type: '',
    recipientWarningAcknowledged: false,
  },
  status: SEND_STATUSES.VALID,
  transactionType: TransactionEnvelopeType.legacy,
  userInputHexData: null,
};

/**
 * Describes the state tree of the send slice
 *
 * @typedef {object} SendState
 * @property {MapValuesToUnion<SendStateAmountModes>} amountMode - Describe
 *  whether the user has manually input an amount or if they have selected max
 *  to send the maximum amount of the selected currency.
 * @property {string} currentTransactionUUID - The UUID of the transaction
 *  currently being modified by the send flow. This UUID is generated upon
 *  initialization of the send flow, any previous UUIDs are discarded at
 *  clean up AND during initialization. When a transaction is edited a new UUID
 *  is generated for it and the state of that transaction is copied into a new
 *  entry in the draftTransactions object.
 * @property {Object<string, DraftTransaction>} draftTransactions - An object keyed
 *  by UUID with draftTransactions as the values.
 * @property {boolean} eip1559support - tracks whether the current network
 *  supports EIP 1559 transactions.
 * @property {boolean} gasEstimateIsLoading - Indicates whether the gas
 *  estimate is loading.
 * @property {string} [gasEstimatePollToken] - String token identifying a
 *  listener for polling on the gasFeeController
 * @property {boolean} gasIsSetInModal - true if the user set custom gas in the
 *  custom gas modal
 * @property {string} gasLimitMinimum - minimum supported gasLimit.
 * @property {string} gasPriceEstimate - Expected price in wei necessary to
 *  pay per gas used for a transaction to be included in a reasonable timeframe.
 *  Comes from the GasFeeController.
 * @property {string} gasTotalForLayer1 -  Layer 1 gas fee total on multi-layer
 *  fee networks
 * @property {string} recipientInput - The user input of the recipient
 *  which is updated quickly to avoid delays in the UI reflecting manual entry
 *  of addresses.
 * @property {MapValuesToUnion<SendStateRecipientModes>} recipientMode -
 *  Describes which list of recipients the user is shown on the add recipient
 *  screen. When this key is set to 'MY_ACCOUNTS' the user is shown the list of
 *  accounts they own. When it is 'CONTACT_LIST' the user is shown the list of
 *  contacts they have saved in MetaMask and any addresses they have recently
 *  sent to.
 * @property {Account} selectedAccount - The currently selected account in
 *  MetaMask. Native balance and address will be pulled from this account if a
 *  fromAccount is not specified in the draftTransaction object. During an edit
 *  the fromAccount is specified.
 * @property {MapValuesToUnion<SendStateStages>} stage - The stage of the
 *  send flow that the user has progressed to. Defaults to 'INACTIVE' which
 *  results in the send screen not being shown.
 */

/**
 * @type {SendState}
 */
export const initialState = {
  amountMode: AMOUNT_MODES.INPUT,
  currentTransactionUUID: null,
  draftTransactions: {},
  eip1559support: false,
  gasEstimateIsLoading: true,
  gasEstimatePollToken: null,
  gasIsSetInModal: false,
  gasPriceEstimate: '0x0',
  gasLimitMinimum: GAS_LIMITS.SIMPLE,
  gasTotalForLayer1: '0x0',
  recipientMode: RECIPIENT_SEARCH_MODES.CONTACT_LIST,
  recipientInput: '',
  selectedAccount: {
    address: null,
    balance: '0x0',
  },
  stage: SEND_STAGES.INACTIVE,
};

/**
 * TODO: We really need to start creating the metamask state type, and the
 * entire state tree of redux. Would be *extremely* valuable in future
 * typescript conversions. The metamask key is typed as an object on purpose
 * here because I cannot go so far in this work as to type that entire object.
 *
 * @typedef {object} MetaMaskState
 * @property {SendState} send - The state of the send flow.
 * @property {object} metamask - The state of the metamask store.
 */

const name = 'send';

// After modification of specific fields in specific circumstances we must
// recompute the gasLimit estimate to be as accurate as possible. the cases
// that necessitate this logic are listed below:
// 1. when the amount sent changes when sending a token due to the amount being
//    part of the hex encoded data property of the transaction.
// 2. when updating the data property while sending NATIVE currency (ex: ETH)
//    because the data parameter defines function calls that the EVM will have
//    to execute which is where a large chunk of gas is potentially consumed.
// 3. when the recipient changes while sending a token due to the recipient's
//    address being included in the hex encoded data property of the
//    transaction
// 4. when the asset being sent changes due to the contract address and details
//    of the token being included in the hex encoded data property of the
//    transaction. If switching to NATIVE currency (ex: ETH), the gasLimit will
//    change due to hex data being removed (unless supplied by user).
// This method computes the gasLimit estimate which is written to state in an
// action handler in extraReducers.
export const computeEstimatedGasLimit = createAsyncThunk(
  'send/computeEstimatedGasLimit',
  async (_, thunkApi) => {
    const state = thunkApi.getState();
    const { send, metamask } = state;
    const draftTransaction =
      send.draftTransactions[send.currentTransactionUUID];
    const unapprovedTxs = getUnapprovedTxs(state);
    const isMultiLayerFeeNetwork = getIsMultiLayerFeeNetwork(state);
    const transaction = unapprovedTxs[draftTransaction.id];
    const assetInstance = new AssetModel(draftTransaction.asset, {
      getState: () => metamask,
    });

    if (assetInstance.sharedProvider.isEthTypeNetwork) {
      let gasTotalForLayer1;
      if (isMultiLayerFeeNetwork) {
        gasTotalForLayer1 = await fetchEstimatedL1Fee({
          txParams: {
            gasPrice: draftTransaction.gas.gasPrice,
            gas: draftTransaction.gas.gasLimit,
            to: draftTransaction.recipient.address?.toLowerCase(),
            value:
              send.amountMode === AMOUNT_MODES.MAX
                ? send.selectedAccount.balance
                : draftTransaction.amount.value,
            from: send.selectedAccount.address,
            data: draftTransaction.userInputHexData,
            type: '0x0',
          },
        });
      }
      if (
        send.stage !== SEND_STAGES.EDIT ||
        !transaction.dappSuggestedGasFees?.gas ||
        !transaction.userEditedGasLimit
      ) {
        try {
          const gasLimit = await estimateGasLimitForSend({
            assetInstance,
            gasPrice: draftTransaction.gas.gasPrice,
            blockGasLimit: metamask.currentBlockGasLimit,
            selectedAddress: metamask.selectedAddress,
            to: draftTransaction.recipient.address?.toLowerCase(),
            value: draftTransaction.amount.value,
            data: draftTransaction.userInputHexData,
            gasLimit: draftTransaction.gas.gasLimit,
          });
          await thunkApi.dispatch(setCustomGasLimit(gasLimit));
          return {
            gasLimit,
            gasTotalForLayer1,
          };
        } catch (err) {
          return null;
        }
      }
    }
    return null;
  },
);

/**
 * @typedef {object} Asset
 * @property {AssetType} type - The type of asset that the user
 *  is attempting to send. Defaults to 'NATIVE' which represents the native
 *  asset of the chain. Can also be 'TOKEN' or 'NFT'.
 * @property {string} balance - A hex string representing the balance
 *  that the user holds of the asset that they are attempting to send.
 * @property {TokenDetails} [details] - An object that describes the
 *  selected asset in the case that the user is sending a token or collectibe.
 *  Will be null when asset.type is 'NATIVE'.
 * @property {string} [error] - Error to display when there is an issue
 *  with the asset.
 */

/**
 * Responsible for initializing required state for the send slice.
 * This method is dispatched from the send page in the componentDidMount
 * method. It is also dispatched anytime the network changes to ensure that
 * the slice remains valid with changing token and account balances. To do so
 * it keys into state to get necessary values and computes a starting point for
 * the send slice. It returns the values that might change from this action and
 * those values are written to the slice in the `initializeSendState.fulfilled`
 * action handler.
 */
export const initializeSendState = createAsyncThunk(
  'send/initializeSendState',
  async ({ chainHasChanged = false } = {}, thunkApi) => {
    /**
     * @typedef {object} ReduxState
     * @property {object} metamask - Half baked type for the MetaMask object
     * @property {SendState} send - the send state
     */

    /**
     * @type {ReduxState}
     */
    const state = thunkApi.getState();
    const { send: sendState, metamask } = state;
    const draftTransaction =
      sendState.draftTransactions[sendState.currentTransactionUUID];
    // If the draft transaction is not present, then this action has been
    // dispatched out of sync with the intended flow. This is not always a bug.
    // For instance, in the actions.js file we dispatch this action anytime the
    // chain changes.
    if (!draftTransaction) {
      return thunkApi.rejectWithValue(
        'draftTransaction not found, possibly not on send flow',
      );
    }
    const assetInstance = new AssetModel(draftTransaction.asset.localId, {
      getState: () => metamask,
    });

    // Default gasPrice to 1 gwei if all estimation fails, this is only used
    // for gasLimit estimation and won't be set directly in state. Instead, we
    // will return the gasFeeEstimates and gasEstimateType so that the reducer
    // can set the appropriate gas fees in state.
    let gasPrice =
      sendState.stage === SEND_STAGES.EDIT
        ? draftTransaction.gas.gasPrice
        : '0x1';
    // Set a basic gasLimit in the event that other estimation fails
    let { gasLimit } = draftTransaction.gas;

    let gasEstimatePollToken = null;
    let gasFeeEstimates = null;
    let gasEstimateType = null;

    if (assetInstance.sharedProvider.isEthTypeNetwork) {
      // Instruct the background process that polling for gas prices should begin
      gasEstimatePollToken = await getGasFeeEstimatesAndStartPolling(
        assetInstance.chainId,
      );
      addPollingTokenToAppState(gasEstimatePollToken);

      gasFeeEstimates = state.metamask.gasFeeEstimates;
      gasEstimateType = state.metamask.gasEstimateType;

      if (sendState.stage !== SEND_STAGES.EDIT) {
        // Because we are only interested in getting a gasLimit estimation we only
        // need to worry about gasPrice. So we use maxFeePerGas as gasPrice if we
        // have a fee market estimation.
        if (gasEstimateType === GasEstimateTypes.legacy) {
          gasPrice = getGasPriceInHexWei(gasFeeEstimates.medium);
        } else if (gasEstimateType === GasEstimateTypes.ethGasPrice) {
          gasPrice = getRoundedGasPrice(gasFeeEstimates.gasPrice);
        } else if (gasEstimateType === GasEstimateTypes.feeMarket) {
          gasPrice = getGasPriceInHexWei(
            gasFeeEstimates.medium.suggestedMaxFeePerGas,
          );
        } else {
          gasPrice = gasFeeEstimates.gasPrice
            ? getRoundedGasPrice(gasFeeEstimates.gasPrice)
            : '0x0';
        }
      }
      if (
        gasEstimateType !== GasEstimateTypes.none &&
        sendState.stage !== SEND_STAGES.EDIT &&
        draftTransaction.recipient.address
      ) {
        gasLimit =
          draftTransaction.asset.type === AssetType.token ||
          draftTransaction.asset.type === AssetType.NFT
            ? GAS_LIMITS.BASE_TOKEN_ESTIMATE
            : GAS_LIMITS.SIMPLE;
        // Run our estimateGasLimit logic to get a more accurate estimation of
        // required gas. If this value isn't nullish, set it as the new gasLimit
        const estimatedGasLimit = await estimateGasLimitForSend({
          gasPrice,
          assetInstance,
          blockGasLimit: metamask.currentBlockGasLimit,
          selectedAddress:
            draftTransaction.fromAccount?.address ??
            sendState.selectedAccount.address,
          to: draftTransaction.recipient.address.toLowerCase(),
          value: draftTransaction.amount.value,
          data: draftTransaction.userInputHexData,
        });
        gasLimit = estimatedGasLimit || gasLimit;
      }
      // We have to keep the gas slice in sync with the send slice state
      // so that it'll be initialized correctly if the gas modal is opened.
      await thunkApi.dispatch(setCustomGasLimit(gasLimit));
    }

    // There may be a case where the send has been canceled by the user while
    // the gas estimate is being computed. So we check again to make sure that
    // a currentTransactionUUID exists and matches the previous tx.
    const newState = thunkApi.getState();
    if (
      newState.send.currentTransactionUUID !== sendState.currentTransactionUUID
    ) {
      return thunkApi.rejectWithValue(
        `draftTransaction changed during initialization.
        A new initializeSendState action must be dispatched.`,
      );
    }

    return {
      account: {
        address: draftTransaction.asset.account,
        balance: draftTransaction.asset.balance,
      },
      chainId: assetInstance.chainId,
      tokens: getTokens(state),
      chainHasChanged,
      gasFeeEstimates,
      gasEstimateType,
      gasLimit,
      isEthTypeNetwork: assetInstance.sharedProvider.isEthTypeNetwork,
      gasTotal: addHexPrefix(calcGasTotal(gasLimit, gasPrice)),
      gasEstimatePollToken,
      eip1559support: assetInstance.sharedProvider.eip1559support,
      isNonStandardEthChain: !assetInstance.sharedProvider.isEthTypeNetwork, // TODO: Research why need this
      useTokenDetection: getUseTokenDetection(state),
      tokenAddressList: Object.keys(getTokenList(state)),
      walletAddress: state.metamask.selectedAddress,
      networkConfiguration: assetInstance.sharedProvider.config,
    };
  },
);

// Action Payload Typedefs
/**
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<string>
 * )} SimpleStringPayload
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<MapValuesToUnion<SendStateAmountModes>>
 * )} SendStateAmountModePayload
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<DraftTransaction['asset']>
 * )} UpdateAssetPayload
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<Partial<
 *   Pick<DraftTransaction['recipient'], 'address' | 'nickname'>>
 *  >
 * )} updateRecipientPayload
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<SendState['recipientMode']>
 * )} UpdateRecipientModePayload
 */

/**
 * @typedef {object} GasFeeUpdateParams
 * @property {TransactionType} transactionType - The transaction type
 * @property {string} [maxFeePerGas] - The maximum amount in hex wei to pay
 *  per gas on a FEE_MARKET transaction.
 * @property {string} [maxPriorityFeePerGas] - The maximum amount in hex
 *  wei to pay per gas as an incentive to miners on a FEE_MARKET
 *  transaction.
 * @property {string} [gasPrice] - The amount in hex wei to pay per gas on
 *  a LEGACY transaction.
 * @property {boolean} [isAutomaticUpdate] - true if the update is the
 *  result of a gas estimate update from the controller.
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<GasFeeUpdateParams>
 * )} GasFeeUpdatePayload
 */

/**
 * @typedef {object} GasEstimateUpdateParams
 * @property {GasEstimateType} gasEstimateType - The type of gas estimation
 *  provided by the controller.
 * @property {(
 *  EthGasPriceEstimate | LegacyGasPriceEstimate | GasFeeEstimates
 * )} gasFeeEstimates - The gas fee estimates provided by the controller.
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<GasEstimateUpdateParams>
 * )} GasEstimateUpdatePayload
 */

/**
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<DraftTransaction['asset']>
 * )} UpdateAssetPayload
 * @typedef {(
 *  import('@reduxjs/toolkit').PayloadAction<DraftTransaction>
 * )} DraftTransactionPayload
 */

const slice = createSlice({
  name,
  initialState,
  reducers: {
    /**
     * Adds a new draft transaction to state, first generating a new UUID for
     * the transaction and setting that as the currentTransactionUUID. If the
     * draft has an id property set, the stage is set to EDIT.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {DraftTransactionPayload} action - An action with payload that is
     *  a new draft transaction that will be added to state.
     * @returns {void}
     */
    addNewDraft: (state, action) => {
      state.currentTransactionUUID = action.payload?.multisignId || uuidv4();
      state.draftTransactions[state.currentTransactionUUID] = action.payload;
      if (action.payload.id) {
        state.stage = SEND_STAGES.EDIT;
      } else {
        state.stage = SEND_STAGES.ADD_RECIPIENT;
      }
    },
    /**
     * Adds an entry, with timestamp, to the draftTransaction history.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {SimpleStringPayload} action - An action with payload that is
     *  a string to be added to the history of the draftTransaction
     * @returns {void}
     */
    addHistoryEntry: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      if (draftTransaction) {
        draftTransaction.history.push({
          entry: action.payload,
          timestamp: Date.now(),
        });
      }
    },
    /**
     * gasTotal is computed based on gasPrice and gasLimit and set in state
     * recomputes the maximum amount if the current amount mode is 'MAX' and
     * sending the native token. ERC20 assets max amount is unaffected by
     * gasTotal so does not need to be recomputed. Finally, validates the gas
     * field and send state.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    calculateGasTotal: (state) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      // use maxFeePerGas as the multiplier if working with a FEE_MARKET transaction
      // otherwise use gasPrice
      if (
        draftTransaction.transactionType === TransactionEnvelopeType.feeMarket
      ) {
        draftTransaction.gas.gasTotal = addHexPrefix(
          calcGasTotal(
            draftTransaction.gas.gasLimit,
            draftTransaction.gas.maxFeePerGas,
          ),
        );
      } else {
        draftTransaction.gas.gasTotal = addHexPrefix(
          calcGasTotal(
            draftTransaction.gas.gasLimit,
            draftTransaction.gas.gasPrice,
          ),
        );
      }
      if (
        state.amountMode === AMOUNT_MODES.MAX &&
        draftTransaction.asset.type === AssetType.native
      ) {
        slice.caseReducers.updateAmountToMax(state);
      }
      slice.caseReducers.validateAmountField(state);
      slice.caseReducers.validateGasField(state);
      // validate send state
      slice.caseReducers.validateSendState(state);
    },
    /**
     * Clears all drafts from send state and drops the currentTransactionUUID.
     * This is an important first step before adding a new draft transaction to
     * avoid possible collision.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    clearPreviousDrafts: (state) => {
      state.currentTransactionUUID = null;
      state.draftTransactions = {};
    },
    /**
     * Clears the send state by setting it to the initial value
     *
     * @returns {SendState}
     */
    resetSendState: () => initialState,
    /**
     * sets the amount mode to the provided value as long as it is one of the
     * supported modes (MAX|INPUT)
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {SendStateAmountModePayload} action - The amount mode
     *  to set the state to.
     * @returns {void}
     */
    updateAmountMode: (state, action) => {
      if (Object.values(AMOUNT_MODES).includes(action.payload)) {
        state.amountMode = action.payload;
      }
    },
    /**
     * computes the maximum amount of asset that can be sent and then calls
     * the updateSendAmount action above with the computed value, which will
     * revalidate the field and form.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    updateAmountToMax: (state) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      let amount = '0x0';
      switch (true) {
        case [AssetType.token].includes(draftTransaction.asset.type):
          amount = new Numeric(draftTransaction.asset.balance, 16).toString();
          break;
        default: {
          const _gasTotal = new Numeric(
            draftTransaction.gas.gasTotal || '0x0',
            16,
          ).add(new Numeric(state.gasTotalForLayer1 || '0x0', 16));

          amount = new Numeric(draftTransaction.asset.balance, 16)
            .minus(_gasTotal)
            .toString();
        }
      }

      slice.caseReducers.updateSendAmount(state, {
        payload: amount,
      });
    },
    /**
     * Updates the currently selected asset
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {UpdateAssetPayload} action - The asset to set in the
     *  draftTransaction.
     * @returns {void}
     */
    updateAsset: (state, action) => {
      const { asset, initialAssetSet } = action.payload;
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];

      Object.assign(draftTransaction.asset, asset);

      if (draftTransaction.asset.type === AssetType.native) {
        if (draftTransaction.recipient.error === CONTRACT_ADDRESS_ERROR) {
          // Errors related to sending tokens to their own contract address
          // are no longer valid when sending native currency.
          draftTransaction.recipient.error = null;
        }
      }
      // if amount mode is MAX update amount to max of new asset, otherwise set
      // to zero. This will revalidate the send amount field.
      if (state.amountMode === AMOUNT_MODES.MAX) {
        slice.caseReducers.updateAmountToMax(state);
      } else if (initialAssetSet === false) {
        slice.caseReducers.updateSendAmount(state, { payload: '0x0' });
      }
      // validate send state
      slice.caseReducers.validateSendState(state);
    },
    /**
     * Updates the currently selected gas
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {any} action - The gas to set in the draftTransaction.*
     * @returns {void}
     */
    updateGas: (state, action) => {
      const { rate = null, weight = null } = action.payload;
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      const isMaxMode = state?.amountMode === AMOUNT_MODES.MAX;
      const {
        asset: { decimals, isMultisign },
      } = draftTransaction;

      if (!isMultisign) {
        return;
      }

      if (rate) {
        draftTransaction.gas.rate = rate;
      }

      if (weight) {
        draftTransaction.gas.weight = weight;
      }

      const r = draftTransaction.gas.rate;
      const w = draftTransaction.gas.weight;

      const _fee = r * w;
      const _feeTotal = _fee < 1000 ? 1000 : _fee;

      draftTransaction.gas.fee = _feeTotal / 10 ** decimals;
      draftTransaction.gas.gasTotal = Number(_feeTotal).toString(16);

      if (isMaxMode) {
        slice.caseReducers.updateAmountToMax(state);
      } else {
        slice.caseReducers.validateAmountField(state);
        slice.caseReducers.validateSendState(state);
      }
    },
    /**
     * Sets the appropriate gas fees in state after receiving new estimates.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {GasEstimateUpdatePayload)} action - The gas fee update payload
     * @returns {void}
     */
    updateGasFeeEstimates: (state, action) => {
      const { gasFeeEstimates, gasEstimateType } = action.payload;
      let gasPriceEstimate = '0x0';
      switch (gasEstimateType) {
        case GasEstimateTypes.feeMarket:
          slice.caseReducers.updateGasFees(state, {
            payload: {
              transactionType: TransactionEnvelopeType.feeMarket,
              maxFeePerGas: getGasPriceInHexWei(
                gasFeeEstimates.medium.suggestedMaxFeePerGas,
              ),
              maxPriorityFeePerGas: getGasPriceInHexWei(
                gasFeeEstimates.medium.suggestedMaxPriorityFeePerGas,
              ),
            },
          });
          break;
        case GasEstimateTypes.legacy:
          gasPriceEstimate = getRoundedGasPrice(gasFeeEstimates.medium);
          slice.caseReducers.updateGasFees(state, {
            payload: {
              gasPrice: gasPriceEstimate,
              type: TransactionEnvelopeType.legacy,
              isAutomaticUpdate: true,
            },
          });
          break;
        case GasEstimateTypes.ethGasPrice:
          gasPriceEstimate = getRoundedGasPrice(gasFeeEstimates.gasPrice);
          slice.caseReducers.updateGasFees(state, {
            payload: {
              gasPrice: getRoundedGasPrice(gasFeeEstimates.gasPrice),
              type: TransactionEnvelopeType.legacy,
              isAutomaticUpdate: true,
            },
          });
          break;
        case GasEstimateTypes.none:
        default:
          break;
      }
      // Record the latest gasPriceEstimate for future comparisons
      state.gasPriceEstimate = addHexPrefix(gasPriceEstimate);
    },
    /**
     * Sets the appropriate gas fees in state and determines and sets the
     * appropriate transactionType based on gas fee fields received.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {GasFeeUpdatePayload} action - The gas fees to update with
     * @returns {void}
     */
    updateGasFees: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];

      if (!draftTransaction) {
        return;
      }

      if (
        action.payload.transactionType === TransactionEnvelopeType.feeMarket
      ) {
        draftTransaction.gas.maxFeePerGas = addHexPrefix(
          action.payload.maxFeePerGas,
        );
        draftTransaction.gas.maxPriorityFeePerGas = addHexPrefix(
          action.payload.maxPriorityFeePerGas,
        );
        draftTransaction.transactionType = TransactionEnvelopeType.feeMarket;
      } else {
        if (action.payload.manuallyEdited) {
          draftTransaction.gas.wasManuallyEdited = true;
        }

        // Update the gas price if it has not been manually edited,
        // or if this current action is a manual edit.
        if (
          !draftTransaction.gas.wasManuallyEdited ||
          action.payload.manuallyEdited
        ) {
          draftTransaction.gas.gasPrice = addHexPrefix(action.payload.gasPrice);
        }
        draftTransaction.transactionType = TransactionEnvelopeType.legacy;
      }

      slice.caseReducers.calculateGasTotal(state);
    },
    /**
     * sets the provided gasLimit in state and then recomputes the gasTotal.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {SimpleStringPayload} action - The
     *  gasLimit in hex to set in state.
     * @returns {void}
     */
    updateGasLimit: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      if (draftTransaction) {
        draftTransaction.gas.gasLimit = addHexPrefix(action.payload);
        slice.caseReducers.calculateGasTotal(state);
      }
    },
    /**
     * sets the layer 1 fees total (for a multi-layer fee network)
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {SimpleStringPayload} action - the
     *  gasTotalForLayer1 to set in hex wei.
     * @returns {void}
     */
    updateLayer1Fees: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      state.gasTotalForLayer1 = action.payload;
      if (
        state.amountMode === AMOUNT_MODES.MAX &&
        draftTransaction.asset.type === AssetType.native
      ) {
        slice.caseReducers.updateAmountToMax(state);
      }
    },
    /**
     * Updates the recipient of the draftTransaction
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {updateRecipientPayload} action - The recipient to set in the
     *  draftTransaction.
     * @returns {void}
     */
    updateRecipient: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      draftTransaction.recipient.error = null;
      state.recipientInput = '';
      draftTransaction.recipient.address = action.payload.address ?? '';
      draftTransaction.recipient.nickname = action.payload.nickname ?? '';

      if (draftTransaction.recipient.address === '') {
        // If address is null we are clearing the recipient and must return
        // to the ADD_RECIPIENT stage.
        state.stage = SEND_STAGES.ADD_RECIPIENT;
      } else {
        // if an address is provided and an id exists, we progress to the EDIT
        // stage, otherwise we progress to the DRAFT stage. We also reset the
        // search mode for recipient search.
        state.stage =
          draftTransaction.id === null ? SEND_STAGES.DRAFT : SEND_STAGES.EDIT;
        state.recipientMode = RECIPIENT_SEARCH_MODES.CONTACT_LIST;
      }

      // validate send state
      slice.caseReducers.validateSendState(state);
    },
    /**
     * Clears the user input and changes the recipient search mode to the
     * specified value
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {UpdateRecipientModePayload} action - The mode to set the
     *  recipient search to
     * @returns {void}
     */
    updateRecipientSearchMode: (state, action) => {
      state.recipientInput = '';
      state.recipientMode = action.payload;
    },

    updateRecipientWarning: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      draftTransaction.recipient.warning = action.payload;
    },

    updateRecipientType: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      draftTransaction.recipient.type = action.payload;
    },

    updateDraftTransactionStatus: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      draftTransaction.status = action.payload;
    },

    acknowledgeRecipientWarning: (state) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      draftTransaction.recipient.recipientWarningAcknowledged = true;
      slice.caseReducers.validateSendState(state);
    },

    /**
     * Updates the value of the recipientInput key with what the user has
     * typed into the recipient input field in the UI.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {SimpleStringPayload} action - the value the user has typed into
     *  the recipient field.
     * @returns {void}
     */
    updateRecipientUserInput: (state, action) => {
      // Update the value in state to match what the user is typing into the
      // input field
      state.recipientInput = action.payload;
    },
    /**
     * update current amount.value in state and run post update validation of
     * the amount field and the send state.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {SimpleStringPayload} action - The hex string to be set as the
     *  amount value.
     * @returns {void}
     */
    updateSendAmount: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      draftTransaction.amount.value = addHexPrefix(action.payload);

      // Once amount has changed, validate the field
      slice.caseReducers.validateAmountField(state);
      if (draftTransaction.asset.type === AssetType.native) {
        // if sending the native asset the amount being sent will impact the
        // gas field as well because the gas validation takes into
        // consideration the available balance minus amount sent before
        // checking if there is enough left to cover the gas fee.
        slice.caseReducers.validateGasField(state);
      }
      // validate send state
      slice.caseReducers.validateSendState(state);
    },
    /**
     * updates the userInputHexData state key
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @param {SimpleStringPayload} action - The hex string to be set as the
     *  userInputHexData value.
     * @returns {void}
     */
    updateUserInputHexData: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      draftTransaction.userInputHexData = action.payload;
    },
    /**
     * Updates the gasIsSetInModal property to true which results in showing
     * the gas fees from the custom gas modal in the send page.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    useCustomGas: (state) => {
      state.gasIsSetInModal = true;
    },
    /**
     * Updates the gasIsSetInModal property to false which results in showing
     * the default gas price/limit fields in the send page.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    useDefaultGas: (state) => {
      state.gasIsSetInModal = false;
    },
    /**
     * Checks for the validity of the draftTransactions selected amount to send
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    validateAmountField: async (state) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];

      if (!draftTransaction) {
        return;
      }

      const amountValue = new Numeric(draftTransaction.amount.value, 16);

      const { asset, amount, gas } = draftTransaction;

      switch (true) {
        // set error to INSUFFICIENT_FUNDS_FOR_GAS_ERROR if the account balance is lower
        // than the total price of the transaction inclusive of gas fees.
        case asset.type === AssetType.native &&
          !isBalanceSufficient({
            amount: amount.value,
            balance: asset.balance,
            gasTotal: gas.gasTotal ?? '0x0',
          }):
          draftTransaction.amount.error = INSUFFICIENT_TOKENS_ERROR;
          break;
        // set error to INSUFFICIENT_TOKENS_ERROR if the token balance is lower
        // than the amount of token the user is attempting to send.
        case draftTransaction.asset.type === AssetType.token &&
          !isTokenBalanceSufficient({
            tokenBalance: asset.balance ?? '0x0',
            amount: amount.value,
          }):
          draftTransaction.amount.error = INSUFFICIENT_TOKENS_ERROR;
          break;
        // if the amount is negative, set error to NEGATIVE_ETH_ERROR
        // TODO: change this to NEGATIVE_ERROR and remove the currency bias.
        case amountValue.isNegative():
          draftTransaction.amount.error = NEGATIVE_ASSET_ERROR;
          break;
        // If none of the above are true, set error to null
        default:
          draftTransaction.amount.error = null;
      }
    },
    /**
     * Checks if the user has enough funds to cover the cost of gas, always
     * uses the native currency and does not take into account the amount
     * being sent. If the user has enough to cover cost of gas but not gas
     * + amount then the error will be displayed on the amount field.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    validateGasField: (state) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];

      if (!draftTransaction) {
        return;
      }

      const { asset, amount, gas } = draftTransaction;

      const insufficientFunds = !isBalanceSufficient({
        amount: asset.type === AssetType.native ? amount.value : '0x0',
        // balance: isBTCMultisign
        //   ? asset.subDetails.balance ?? state.selectedAccount.balance
        //   : asset?.balance ?? state.selectedAccount.balance,
        balance: asset?.balance,
        gasTotal: gas.gasTotal ?? '0x0',
        decimals: asset?.decimals,
      });

      draftTransaction.gas.error = insufficientFunds
        ? INSUFFICIENT_FUNDS_ERROR
        : null;
    },
    validateRecipientUserInput: (state, action) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];

      if (!draftTransaction) {
        slice.caseReducers.validateSendState(state);
      }

      if (
        state.recipientMode === RECIPIENT_SEARCH_MODES.MY_ACCOUNTS ||
        state.recipientInput === '' ||
        state.recipientInput === null
      ) {
        draftTransaction.recipient.error = null;
        draftTransaction.recipient.warning = null;
      } else {
        const { isProbablyAnAssetContract } = action.payload;
        const sharedProvider = getSharedProvider(
          draftTransaction.networkConfiguration,
        );
        if (!sharedProvider.isAddress(state.recipientInput)) {
          draftTransaction.recipient.error = INVALID_RECIPIENT_ADDRESS_ERROR;
        } else if (
          isOriginContractAddress(
            state.recipientInput,
            draftTransaction.asset.address,
          )
        ) {
          draftTransaction.recipient.error = CONTRACT_ADDRESS_ERROR;
        } else {
          draftTransaction.recipient.error = null;
        }
        if (isProbablyAnAssetContract) {
          draftTransaction.recipient.warning = KNOWN_RECIPIENT_ADDRESS_WARNING;
        } else {
          draftTransaction.recipient.warning = null;
        }
      }
      slice.caseReducers.validateSendState(state);
    },
    /**
     * Checks if the draftTransaction is currently valid. The following list of
     * cases from the switch statement in this function describe when the
     * transaction is invalid. Please keep this comment updated.
     *
     * case 1: State is invalid when amount field has an error.
     * case 2: State is invalid when gas field has an error.
     * case 3: State is invalid when asset field has an error.
     * case 4: State is invalid if asset type is a token and the token details
     *  are unknown.
     * case 5: State is invalid if no recipient has been added.
     * case 6: State is invalid if the send state is uninitialized.
     * case 7: State is invalid if gas estimates are loading.
     * case 8: State is invalid if gasLimit is less than the gasLimitMinimum.
     *
     * @param {SendStateDraft} state - A writable draft of the send state to be
     *  updated.
     * @returns {void}
     */
    validateSendState: (state) => {
      const draftTransaction =
        state.draftTransactions[state.currentTransactionUUID];
      slice.caseReducers.addHistoryEntry(state, {
        payload: 'Begin validating send state',
      });
      if (draftTransaction) {
        switch (true) {
          case Boolean(draftTransaction.amount.error):
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Amount is in error ${draftTransaction.amount.error}`,
            });
            draftTransaction.status = SEND_STATUSES.INVALID;
            break;
          // case Boolean(draftTransaction.gas.error):
          //   slice.caseReducers.addHistoryEntry(state, {
          //     payload: `Gas is in error ${draftTransaction.gas.error}`,
          //   });
          //   draftTransaction.status = SEND_STATUSES.INVALID;
          //   break;
          case Boolean(draftTransaction.asset.error):
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Asset is in error ${draftTransaction.asset.error}`,
            });
            draftTransaction.status = SEND_STATUSES.INVALID;
            break;
          case draftTransaction.asset.type === AssetType.token &&
            draftTransaction.asset.details === null:
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Asset is TOKEN and token details is null`,
            });
            draftTransaction.status = SEND_STATUSES.INVALID;
            break;
          case state.stage === SEND_STAGES.ADD_RECIPIENT:
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Form is invalid because stage is ADD_RECIPIENT`,
            });
            draftTransaction.status = SEND_STATUSES.INVALID;
            break;
          case state.stage === SEND_STAGES.INACTIVE:
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Form is invalid because stage is INACTIVE`,
            });
            draftTransaction.status = SEND_STATUSES.INVALID;
            break;
          // case state.gasEstimateIsLoading:
          //   slice.caseReducers.addHistoryEntry(state, {
          //     payload: `Form is invalid because gasEstimateIsLoading`,
          //   });
          //   draftTransaction.status = SEND_STATUSES.INVALID;
          //   break;
          // case new BigNumber(draftTransaction.gas.gasLimit, 16).lessThan(
          //   new BigNumber(state.gasLimitMinimum),
          // ):
          //   slice.caseReducers.addHistoryEntry(state, {
          //     payload: `Form is invalid because ${draftTransaction.gas.gasLimit} is lessThan ${state.gasLimitMinimum}`,
          //   });
          //   draftTransaction.status = SEND_STATUSES.INVALID;
          //   break;
          case draftTransaction.recipient.warning === 'loading':
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Form is invalid because recipient warning is loading`,
            });
            draftTransaction.status = SEND_STATUSES.INVALID;
            break;
          case draftTransaction.recipient.warning ===
            KNOWN_RECIPIENT_ADDRESS_WARNING &&
            draftTransaction.recipient.recipientWarningAcknowledged === false:
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Form is invalid because recipient warning not acknolwedged`,
            });
            draftTransaction.status = SEND_STATUSES.INVALID;
            break;
          default:
            slice.caseReducers.addHistoryEntry(state, {
              payload: `Form is valid`,
            });
            draftTransaction.status = SEND_STATUSES.VALID;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ACCOUNT_CHANGED, (state, action) => {
        // This event occurs when the user's account details update due to
        // background state changes. If the account that is being updated is
        // the current from account on the edit flow we need to update
        // the balance for the account and revalidate the send state.
        if (state.stage === SEND_STAGES.EDIT && action.payload.account) {
          const draftTransaction =
            state.draftTransactions[state.currentTransactionUUID];
          if (
            draftTransaction &&
            draftTransaction.fromAccount &&
            draftTransaction.fromAccount.address ===
              action.payload.account.address
          ) {
            draftTransaction.fromAccount.balance =
              action.payload.account.balance;
            // We need to update the asset balance if the asset is the native
            // network asset. Once we update the balance we recompute error state.
            if (draftTransaction.asset.type === AssetType.native) {
              draftTransaction.asset.balance = action.payload.account.balance;
            }
            slice.caseReducers.validateAmountField(state);
            slice.caseReducers.validateGasField(state);
            slice.caseReducers.validateSendState(state);
          }
        }
      })
      .addCase(ADDRESS_BOOK_UPDATED, (state, action) => {
        // When the address book updates from background state changes we need
        // to check to see if an entry exists for the current address or if the
        // entry changed.
        const { addressBook } = action.payload;
        const draftTransaction =
          state.draftTransactions[state.currentTransactionUUID];
        if (
          draftTransaction &&
          addressBook[draftTransaction.recipient.address]?.name
        ) {
          draftTransaction.recipient.nickname =
            addressBook[draftTransaction.recipient.address].name;
        }
      })
      .addCase(computeEstimatedGasLimit.pending, (state) => {
        // When we begin to fetch gasLimit we should indicate we are loading
        // a gas estimate.
        state.gasEstimateIsLoading = true;
      })
      .addCase(computeEstimatedGasLimit.fulfilled, (state, action) => {
        // When we receive a new gasLimit from the computeEstimatedGasLimit
        // thunk we need to update our gasLimit in the slice. We call into the
        // caseReducer updateGasLimit to tap into the appropriate follow up
        // checks and gasTotal calculation. First set gasEstimateIsLoading to
        // false.
        state.gasEstimateIsLoading = false;
        if (action.payload?.gasLimit) {
          slice.caseReducers.updateGasLimit(state, {
            payload: action.payload.gasLimit,
          });
        }
        if (action.payload?.gasTotalForLayer1) {
          slice.caseReducers.updateLayer1Fees(state, {
            payload: action.payload.gasTotalForLayer1,
          });
        }
      })
      .addCase(computeEstimatedGasLimit.rejected, (state) => {
        // If gas estimation fails, we should set the loading state to false,
        // because it is no longer loading
        state.gasEstimateIsLoading = false;
      })
      .addCase(GAS_FEE_ESTIMATES_UPDATED, (state, action) => {
        // When the gasFeeController updates its gas fee estimates we need to
        // update and validate state based on those new values
        slice.caseReducers.updateGasFeeEstimates(state, {
          payload: action.payload,
        });
      })
      .addCase(initializeSendState.pending, (state) => {
        // when we begin initializing state, which can happen when switching
        // chains even after loading the send flow, we set gasEstimateIsLoading
        // as initialization will trigger a fetch for gasPrice estimates.
        state.gasEstimateIsLoading = true;
      })
      .addCase(initializeSendState.fulfilled, (state, action) => {
        // writes the computed initialized state values into the slice and then
        // calculates slice validity using the caseReducers.
        state.eip1559support = action.payload.eip1559support;
        state.selectedAccount.address = action.payload.account.address;
        state.selectedAccount.balance = action.payload.account.balance;
        const draftTransaction =
          state.draftTransactions[state.currentTransactionUUID];
        if (draftTransaction) {
          draftTransaction.gas.gasLimit = action.payload.gasLimit;
          draftTransaction.gas.gasTotal = action.payload.gasTotal;
          draftTransaction.chainId = action.payload.chainId;
          draftTransaction.walletAddress = action.payload.walletAddress;
          draftTransaction.networkConfiguration =
            action.payload.networkConfiguration;
        }
        slice.caseReducers.updateGasFeeEstimates(state, {
          payload: {
            gasFeeEstimates: action.payload.gasFeeEstimates,
            gasEstimateType: action.payload.gasEstimateType,
          },
        });
        state.gasEstimatePollToken = action.payload.gasEstimatePollToken;
        if (action.payload.gasEstimatePollToken) {
          state.gasEstimateIsLoading = false;
        }
        if (state.stage !== SEND_STAGES.INACTIVE) {
          slice.caseReducers.validateRecipientUserInput(state, {
            payload: {
              chainId: action.payload.chainId,
              tokens: action.payload.tokens,
              useTokenDetection: action.payload.useTokenDetection,
              tokenAddressList: action.payload.tokenAddressList,
            },
          });
        }
        if (state.amountMode === AMOUNT_MODES.MAX) {
          slice.caseReducers.updateAmountToMax(state);
        }
        slice.caseReducers.validateAmountField(state);
        slice.caseReducers.validateGasField(state);
        slice.caseReducers.validateSendState(state);
      })
      .addCase(SELECTED_ACCOUNT_CHANGED, (state, action) => {
        // This event occurs when the user selects a new account from the
        // account menu, or the currently active account's balance updates.
        // We only care about new transactions, not edits, here, because we use
        // the fromAccount and ACCOUNT_CHANGED action for that.
        if (state.stage !== SEND_STAGES.EDIT && action.payload.account) {
          state.selectedAccount.balance = action.payload.account.balance;
          state.selectedAccount.address = action.payload.account.address;
          const draftTransaction =
            state.draftTransactions[state.currentTransactionUUID];
          // This action will occur even when we aren't on the send flow, which
          // is okay as it keeps the selectedAccount details up to date. We do
          // not need to validate anything if there isn't a current draft
          // transaction. If there is, we need to update the asset balance if
          // the asset is set to the native network asset, and then validate
          // the transaction.
          if (draftTransaction) {
            if (draftTransaction?.asset.type === AssetType.native) {
              draftTransaction.asset.balance = action.payload.account.balance;
            }
            slice.caseReducers.validateAmountField(state);
            slice.caseReducers.validateGasField(state);
            slice.caseReducers.validateSendState(state);
          }
        }
      })
      .addCase(QR_CODE_DETECTED, (state, action) => {
        // When data is received from the QR Code Scanner we set the recipient
        // as long as a valid address can be pulled from the data. If an
        // address is pulled but it is invalid, we display an error.
        const qrCodeData = action.value;
        const draftTransaction =
          state.draftTransactions[state.currentTransactionUUID];

        if (qrCodeData && draftTransaction) {
          if (qrCodeData.type === 'address') {
            const sharedProvider = getSharedProvider(
              draftTransaction.networkConfiguration,
            );
            const scannedAddress = qrCodeData.values.address;
            if (sharedProvider.isAddress(scannedAddress)) {
              if (
                draftTransaction.recipient.address.toLowerCase() !==
                scannedAddress
              ) {
                slice.caseReducers.updateRecipient(state, {
                  payload: { address: scannedAddress },
                });
              }
            } else {
              draftTransaction.recipient.error =
                INVALID_RECIPIENT_ADDRESS_ERROR;
            }
          }
        }
      });
  },
});

const { actions, reducer } = slice;

export default reducer;

const {
  useDefaultGas,
  useCustomGas,
  updateGasLimit,
  validateRecipientUserInput,
  updateRecipientSearchMode,
  addHistoryEntry,
  acknowledgeRecipientWarning,
} = actions;

export {
  useDefaultGas,
  useCustomGas,
  updateGasLimit,
  addHistoryEntry,
  acknowledgeRecipientWarning,
};

// Action Creators

/**
 * This method is for usage when validating user input so that validation
 * is only run after a delay in typing of 300ms. Usage at callsites requires
 * passing in both the dispatch method and the payload to dispatch, which makes
 * it only applicable for use within action creators.
 */
const debouncedValidateRecipientUserInput = debounce(
  async (dispatch, payload, resolve) => {
    dispatch(
      addHistoryEntry(
        `sendFlow - user typed ${payload.userInput} into recipient input field`,
      ),
    );
    dispatch(validateRecipientUserInput(payload));
    resolve();
  },
  300,
);

const debouncedPostUpdateSendAmount = debounce(
  async (dispatch, getState, resolve) => {
    const state = getState();
    const id = state.send.currentTransactionUUID;
    const draftTransaction =
      state.send.draftTransactions[state.send.currentTransactionUUID];

    const { recipient, amount, asset } = draftTransaction;

    // const assetInstance = dispatch(getAssetModel(asset));
    // actions.updateAsset({
    //   reserves: assetInstance.reserves,
    // });

    if (!asset.isMultisign) {
      return resolve();
    }

    try {
      await dispatch(showLoadingIndication());

      const payload = {
        id,
        amount: new Numeric(amount.value, 16).toNumber(),
        toAddress: recipient.address,
      };

      const weight = await dispatch(multisignTransactionWeight(payload));

      await dispatch(
        actions.updateGas({
          weight,
        }),
      );
    } catch (err) {
      console.error('debouncedPostUpdateSendAmount => err', err);
    } finally {
      await dispatch(hideLoadingIndication());
      resolve();
    }
  },
  600,
);

/**
 * TODO: Rewrite for dextrade
 *
 * Begins a new draft transaction, derived from the txParams of an existing
 * transaction in the TransactionController. This action will first clear out
 * the previous draft transactions and currentTransactionUUID from state. This
 * action is one of the two entry points into the send flow. NOTE: You must
 * route to the send page *after* dispatching this action resolves to ensure
 * that the draftTransaction is properly created.
 *
 * @param {AssetType} assetType - The type of asset the transaction
 *  being edited was sending. The details of the asset will be retrieved from
 *  the transaction data in state.
 * @param {string} transactionId - The id of the transaction being edited.
 * @returns {ThunkAction<void>}
 */
export function editExistingTransaction(assetType, transactionId) {
  return async (dispatch, getState) => {
    await dispatch(actions.clearPreviousDrafts());
    const state = getState();
    const unapprovedTransactions = getUnapprovedTxs(state);
    const transaction = unapprovedTransactions[transactionId];
    const account = getTargetAccount(state, transaction.txParams.from);
    const assetInstance = new AssetModel(transaction.txParams.localId, {
      getState: () => state.metamask,
    });

    if (assetInstance.type === AssetType.native) {
      await dispatch(
        actions.addNewDraft({
          ...draftTransactionInitialState,
          id: transactionId,
          fromAccount: account,
          gas: {
            ...draftTransactionInitialState.gas,
            gasLimit: transaction.txParams.gas,
            gasPrice: transaction.txParams.gasPrice,
          },
          userInputHexData: transaction.txParams.data,
          recipient: {
            ...draftTransactionInitialState.recipient,
            address: transaction.txParams.to,
            nickname:
              getAddressBookEntryOrAccountName(
                state,
                transaction.txParams.to,
              ) ?? '',
          },
          amount: {
            ...draftTransactionInitialState.amount,
            value: transaction.txParams.value,
          },
          history: [
            `sendFlow - user clicked edit on transaction with id ${transactionId}`,
          ],
        }),
      );
      await dispatch(updateSendAsset(assetInstance, { initialAssetSet: true }));
    } else {
      const tokenData = parseStandardTokenTransactionData(
        transaction.txParams.data,
      );
      const tokenAmountInDec =
        assetType === AssetType.token ? getTokenValueParam(tokenData) : '1';
      const address = getTokenAddressParam(tokenData);
      const nickname = getAddressBookEntryOrAccountName(state, address) ?? '';

      const tokenAmountInHex = addHexPrefix(decimalToHex(tokenAmountInDec));
      await dispatch(
        actions.addNewDraft({
          ...draftTransactionInitialState,
          id: transactionId,
          fromAccount: account,
          gas: {
            ...draftTransactionInitialState.gas,
            gasLimit: transaction.txParams.gas,
            gasPrice: transaction.txParams.gasPrice,
          },
          userInputHexData: transaction.txParams.data,
          recipient: {
            ...draftTransactionInitialState.recipient,
            address,
            nickname,
          },
          amount: {
            ...draftTransactionInitialState.amount,
            value: tokenAmountInHex,
          },
          history: [
            `sendFlow - user clicked edit on transaction with id ${transactionId}`,
          ],
        }),
      );

      await dispatch(
        updateSendAsset(
          // {
          //   type: assetType,
          //   details: {
          //     address: transaction.txParams.to,
          //     ...(assetType === AssetType.NFT
          //       ? {
          //           tokenId:
          //             getTokenIdParam(tokenData) ??
          //             getTokenValueParam(tokenData),
          //         }
          //       : {}),
          //   },
          // },
          assetInstance,
          { initialAssetSet: true },
        ),
      );
    }

    await dispatch(initializeSendState());
  };
}

/**
 * This method is a temporary placeholder to support the old UI in both the
 * gas modal and the send flow. Soon we won't need to modify gasPrice from the
 * send flow based on user input, it'll just be a shallow copy of the current
 * estimate. This method is necessary because the internal structure of this
 * slice has been changed such that it is agnostic to transaction envelope
 * type, and this method calls into the new structure in the appropriate way.
 *
 * @deprecated - don't extend the usage of this temporary method
 * @param {string} gasPrice - new gas price in hex wei
 * @returns {ThunkAction<void>}
 */
export function updateGasPrice(gasPrice) {
  return (dispatch) => {
    dispatch(
      addHistoryEntry(`sendFlow - user set legacy gasPrice to ${gasPrice}`),
    );
    dispatch(
      actions.updateGasFees({
        gasPrice,
        transactionType: TransactionEnvelopeType.legacy,
        manuallyEdited: true,
      }),
    );
  };
}

export function updateMultisignGasRate(rate) {
  return (dispatch) => {
    dispatch(
      actions.updateGas({
        rate,
      }),
    );
  };
}

/**
 * Updates the recipient in state based on the input provided, and then will
 * recompute gas limit when sending a TOKEN asset type. Changing the recipient
 * address results in hex data changing because the recipient address is
 * encoded in the data instead of being in the 'to' field. The to field in a
 * token send will always be the token contract address.
 * If no nickname is provided, the address book state will be checked to see if
 * a nickname for the passed address has already been saved. This ensures the
 * (temporary) send state recipient nickname is consistent with the address book
 * nickname which has already been persisted to state.
 *
 * @param {object} recipient - Recipient information
 * @param {string} recipient.address - hex address to send the transaction to
 * @param {string} [recipient.nickname] - Alias for the address to display
 *  to the user
 * @returns {ThunkAction<void>}
 */
export function updateRecipient({ address, nickname }) {
  return async (dispatch, getState) => {
    // Do not addHistoryEntry here as this is called from a number of places
    // each with significance to the user and transaction history.
    const state = getState();
    const nicknameFromAddressBookEntryOrAccountName =
      getAddressBookEntryOrAccountName(state, address) ?? '';
    await dispatch(
      actions.updateRecipient({
        address,
        nickname: nickname || nicknameFromAddressBookEntryOrAccountName,
      }),
    );
    await dispatch(computeEstimatedGasLimit());
  };
}

/**
 * This method is called to update the user's input into the ENS input field.
 * Once the field is updated, the field will be validated using a debounced
 * version of the validateRecipientUserInput action. This way validation only
 * occurs once the user has stopped typing.
 *
 * @param {string} userInput - the value that the user is typing into the field
 */
export function updateRecipientUserInput(userInput) {
  return async (dispatch, getState) => {
    dispatch(actions.updateRecipientWarning('loading'));
    dispatch(actions.updateDraftTransactionStatus(SEND_STATUSES.INVALID));
    await dispatch(actions.updateRecipientUserInput(userInput));
    const state = getState();
    // const draftTransaction =
    //   state[name].draftTransactions[state[name].currentTransactionUUID];
    // const sendingAddress =
    //   draftTransaction.fromAccount?.address ??
    //   state[name].selectedAccount.address ??
    //   getSelectedAddress(state);
    const chainId = getCurrentChainId(state);
    const tokens = getTokens(state);
    const useTokenDetection = getUseTokenDetection(state);
    const tokenMap = getTokenList(state);
    const tokenAddressList = Object.keys(tokenMap);

    // const inputIsValidHexAddress = isValidHexAddress(userInput);
    // let isProbablyAnAssetContract = false;
    // if (inputIsValidHexAddress) {
    //   const smartContractAddress = await isSmartContractAddress(userInput);
    //   if (smartContractAddress) {
    //     dispatch(actions.updateRecipientType(RECIPIENT_TYPES.SMART_CONTRACT));
    //     const { symbol, decimals } =
    //       getTokenMetadata(userInput, tokenMap) || {};

    //     isProbablyAnAssetContract = symbol && decimals !== undefined;

    //     if (!isProbablyAnAssetContract) {
    //       try {
    //         const { standard } = await getTokenStandardAndDetails(
    //           userInput,
    //           sendingAddress,
    //         );
    //         isProbablyAnAssetContract = Boolean(standard);
    //       } catch (e) {
    //         console.log(e);
    //       }
    //     }
    //   }
    // }

    const isProbablyAnAssetContract = false;

    return new Promise((resolve) => {
      debouncedValidateRecipientUserInput(
        dispatch,
        {
          userInput,
          chainId,
          tokens,
          useTokenDetection,
          tokenAddressList,
          isProbablyAnAssetContract,
        },
        resolve,
      );
    });
  };
}

/**
 * Updates the amount the user intends to send and performs side effects.
 * 1. If the current mode is MAX change to INPUT
 * 2. If sending a token, recompute the gasLimit estimate
 *
 * @param {string} amount - hex string representing value
 * @returns {ThunkAction<void>}
 */
export function updateSendAmount(amount) {
  return async (dispatch, getState) => {
    const state = getState();
    const { metamask } = state;
    const draftTransaction =
      state[name].draftTransactions[state[name].currentTransactionUUID];
    let logAmount = amount;
    if (draftTransaction.asset.type === AssetType.token) {
      const multiplier = Math.pow(
        10,
        Number(draftTransaction.asset.decimals || 0),
      );
      const decimalValueString = new Numeric(addHexPrefix(amount), 16)
        .toBase(10)
        .applyConversionRate(
          draftTransaction.asset.symbol ? multiplier : 1,
          true,
        )
        .toString();
      logAmount = `${Number(decimalValueString) ? decimalValueString : ''} ${
        draftTransaction.asset.symbol
      }`;
    } else {
      const ethValue = getValueFromWeiHex({
        value: amount,
        toCurrency: EtherDenomination.ETH,
        numberOfDecimals: 8,
      });
      logAmount = `${ethValue} ${
        metamask?.provider?.ticker || EtherDenomination.ETH
      }`;
    }
    await dispatch(
      addHistoryEntry(`sendFlow - user set amount to ${logAmount}`),
    );
    await dispatch(actions.updateSendAmount(amount));
    if (state[name].amountMode === AMOUNT_MODES.MAX) {
      await dispatch(actions.updateAmountMode(AMOUNT_MODES.INPUT));
    }
    await dispatch(computeEstimatedGasLimit());
    await new Promise((resolve) => {
      debouncedPostUpdateSendAmount(dispatch, getState, resolve);
    });
  };
}

/**
 * updates the asset to send to one of NATIVE or TOKEN and ensures that the
 * asset balance is set. If sending a TOKEN also updates the asset details
 * object with the appropriate ERC20 details including address, symbol and
 * decimals.
 *
 * @param {AssetModel} assetInstance
 * @param {boolean} initialAssetSet
 * @returns {ThunkAction<void>}
 */
export function updateSendAsset(assetInstance, initialAssetSet) {
  return async (dispatch, getState) => {
    // const defaultAsset = { isMultisign, subDetails };
    const balance =
      assetInstance.reserve === undefined
        ? assetInstance.balance
        : assetInstance.reserve * 10 ** assetInstance.decimals;
    const state = getState();
    const details = {
      localId: assetInstance.localId,
      network: assetInstance.network,
      standard: assetInstance.standard,
      name: assetInstance.name,
      uid: assetInstance.uid,
      account: assetInstance.getAccount(),
      decimals: assetInstance.decimals,
      symbol: assetInstance.symbol,
      address: assetInstance.contract,
      reserve: assetInstance.reserve,
      balance: addHexPrefix(decimalToHex(balance)),
      type: assetInstance.type,
    };
    const draftTransaction =
      state[name].draftTransactions[state[name].currentTransactionUUID];
    const sendingAddress =
      draftTransaction.fromAccount?.address ??
      state[name].selectedAccount.address ??
      getSelectedAddress(state);

    if (assetInstance.type === AssetType.native) {
      const unapprovedTxs = getUnapprovedTxs(state);
      const unapprovedTx = unapprovedTxs?.[draftTransaction.id];

      await dispatch(
        addHistoryEntry(
          `sendFlow - user set asset of type ${AssetType.native} with symbol ${assetInstance.symbol}`,
        ),
      );
      await dispatch(
        actions.updateAsset({
          asset: {
            ...details,
            error: null,
          },
          initialAssetSet,
        }),
      );

      // This is meant to handle cases where we are editing an unapprovedTx from the background state
      // and its type is a token method. In such a case, the hex data will be the necessary hex data
      // for calling the contract transfer method.
      // Now that we are updating the transaction to be a send of a native asset type, we should
      // set the hex data of the transaction being editing to be empty.
      // then the user will not want to send any hex data now that they have change the
      if (
        unapprovedTx?.type === TransactionType.tokenMethodTransferFrom ||
        unapprovedTx?.type === TransactionType.tokenMethodTransfer ||
        unapprovedTx?.type === TransactionType.tokenMethodSafeTransferFrom
      ) {
        await dispatch(actions.updateUserInputHexData(''));
      }
    } else {
      const asset = {
        ...details,
        error: null,
      };

      if (
        details.standard === TokenStandard.ERC1155 &&
        details.type === AssetType.NFT
      ) {
        throw new Error('Sends of ERC1155 tokens are not currently supported');
      } else if (
        details.standard === TokenStandard.ERC1155 ||
        details.standard === TokenStandard.ERC721
      ) {
        if (assetInstance.type === AssetType.token && process.env.NFTS_V1) {
          dispatch(
            showModal({
              name: 'CONVERT_TOKEN_TO_NFT',
              tokenAddress: details.address,
            }),
          );
          asset.error = INVALID_ASSET_TYPE;
          throw new Error(INVALID_ASSET_TYPE);
        } else {
          let isCurrentOwner = true;
          try {
            isCurrentOwner = await isNftOwner(
              sendingAddress,
              details.address,
              details.tokenId,
            );
          } catch (err) {
            if (err.message.includes('Unable to verify ownership.')) {
              // this would indicate that either our attempts to verify ownership failed because of network issues,
              // or, somehow a token has been added to collectibles state with an incorrect chainId.
            } else {
              // Any other error is unexpected and should be surfaced.
              dispatch(displayWarning(err.message));
            }
          }

          if (isCurrentOwner) {
            asset.error = null;
            asset.balance = '0x1';
          } else {
            throw new Error(
              'Send slice initialized as collectible send with a collectible not currently owned by the select account',
            );
          }
          await dispatch(
            addHistoryEntry(
              `sendFlow - user set asset to NFT with tokenId ${details.tokenId} and address ${details.address}`,
            ),
          );
        }
      }

      await dispatch(
        addHistoryEntry(
          `sendFlow - user set asset to ERC20 token with symbol ${details.symbol} and address ${details.address}`,
        ),
      );
      await dispatch(actions.updateAsset({ asset, initialAssetSet }));
    }
    if (!initialAssetSet) {
      await dispatch(computeEstimatedGasLimit());
    }
  };
}

/**
 * When a user has enabled hex data field in advanced settings they will be
 * able to supply hex data on a transaction. This method updates the user
 * supplied data. Note, when sending native assets this will result in
 * recomputing estimated gasLimit. When sending a ERC20 asset this is not done
 * because the data sent in the transaction will be determined by the asset,
 * recipient and value, NOT what the user has supplied.
 *
 * @param {string} hexData - hex encoded string representing transaction data.
 * @returns {ThunkAction<void>}
 */
export function updateSendHexData(hexData) {
  return async (dispatch, getState) => {
    await dispatch(
      addHistoryEntry(`sendFlow - user added custom hexData ${hexData}`),
    );

    await dispatch(actions.updateUserInputHexData(hexData));
    const state = getState();
    const draftTransaction =
      state[name].draftTransactions[state[name].currentTransactionUUID];
    if (draftTransaction.asset.type === AssetType.native) {
      await dispatch(computeEstimatedGasLimit());
    }
  };
}

/**
 * Sets the recipient search mode to show a list of the user's contacts and
 * recently interacted with addresses.
 *
 * @returns {ThunkAction<void>}
 */
export function useContactListForRecipientSearch() {
  return (dispatch) => {
    dispatch(
      addHistoryEntry(
        `sendFlow - user selected back to all on recipient screen`,
      ),
    );
    dispatch(updateRecipientSearchMode(RECIPIENT_SEARCH_MODES.CONTACT_LIST));
  };
}

/**
 * Sets the recipient search mode to show a list of the user's own accounts.
 *
 * @returns {ThunkAction<void>}
 */
export function useMyAccountsForRecipientSearch() {
  return (dispatch) => {
    dispatch(
      addHistoryEntry(
        `sendFlow - user selected transfer to my accounts on recipient screen`,
      ),
    );
    dispatch(updateRecipientSearchMode(RECIPIENT_SEARCH_MODES.MY_ACCOUNTS));
  };
}

/**
 * Clears out the recipient user input, ENS resolution and recipient validation.
 *
 * @returns {ThunkAction<void>}
 */
export function resetRecipientInput() {
  return async (dispatch, getState) => {
    const state = getState();
    const chainId = getCurrentChainId(state);
    await dispatch(addHistoryEntry(`sendFlow - user cleared recipient input`));
    await dispatch(updateRecipientUserInput(''));
    await dispatch(updateRecipient({ address: '', nickname: '' }));
    await dispatch(resetDomainResolution());
    await dispatch(validateRecipientUserInput({ chainId }));
  };
}

/**
 * Resets the entire send state tree to the initial state. It also disconnects
 * polling from the gas controller if the token is present in state.
 *
 * @returns {ThunkAction<void>}
 */
export function resetSendState() {
  return async (dispatch, getState) => {
    const state = getState();
    dispatch(actions.resetSendState());

    if (state[name].gasEstimatePollToken) {
      await disconnectGasFeeEstimatePoller(state[name].gasEstimatePollToken);
      removePollingTokenFromAppState(state[name].gasEstimatePollToken);
    }
  };
}

/**
 * Signs a transaction or updates a transaction in state if editing.
 * This method is called when a user clicks the next button in the footer of
 * the send page, signaling that a transaction should be executed. This method
 * will create the transaction in state (by way of the various global provider
 * constructs) which will eventually (and fairly quickly from user perspective)
 * result in a confirmation window being displayed for the transaction.
 *
 * @returns {ThunkAction<void>}
 */
export function signTransaction() {
  return async (dispatch, getState) => {
    const state = getState();
    const { stage } = state[name];
    const txParams = generateTransactionParams(state[name]);
    const draftTransaction =
      state[name].draftTransactions[state[name].currentTransactionUUID];
    const { eip1559support } = draftTransaction;
    if (stage === SEND_STAGES.EDIT) {
      // When dealing with the edit flow there is already a transaction in
      // state that we must update, this branch is responsible for that logic.
      // We first must grab the previous transaction object from state and then
      // merge in the modified txParams. Once the transaction has been modified
      // we can send that to the background to update the transaction in state.
      const unapprovedTxs = getUnapprovedTxs(state);
      const unapprovedTx = unapprovedTxs[draftTransaction.id];
      // We only update the tx params that can be changed via the edit flow UX
      const eip1559OnlyTxParamsToUpdate = {
        data: txParams.data,
        from: txParams.from,
        to: txParams.to,
        value: txParams.value,
        gas: unapprovedTx.userEditedGasLimit
          ? unapprovedTx.txParams.gas
          : txParams.gas,
      };
      unapprovedTx.originalGasEstimate = eip1559OnlyTxParamsToUpdate.gas;
      const editingTx = {
        ...unapprovedTx,
        txParams: Object.assign(
          unapprovedTx.txParams,
          eip1559support ? eip1559OnlyTxParamsToUpdate : txParams,
        ),
      };

      await dispatch(
        addHistoryEntry(
          `sendFlow - user clicked next and transaction should be updated in controller`,
        ),
      );
      await dispatch(
        updateTransactionSendFlowHistory(
          draftTransaction.id,
          unapprovedTx.sendFlowHistory?.length || 0,
          draftTransaction.history,
        ),
      );
      await dispatch(
        updateEditableParams(draftTransaction.id, editingTx.txParams),
      );
      await dispatch(
        updateTransactionGasFees(draftTransaction.id, editingTx.txParams),
      );
    } else {
      let transactionType =
        draftTransaction.recipient.type === RECIPIENT_TYPES.SMART_CONTRACT
          ? TransactionType.contractInteraction
          : TransactionType.simpleSend;

      if (draftTransaction.asset.type !== AssetType.native) {
        transactionType =
          draftTransaction.asset.type === AssetType.NFT
            ? TransactionType.tokenMethodTransferFrom
            : TransactionType.tokenMethodTransfer;
      }
      await dispatch(
        addHistoryEntry(
          `sendFlow - user clicked next and transaction should be added to controller`,
        ),
      );
      await dispatch(
        addUnapprovedTransactionAndRouteToConfirmationPage(
          undefined,
          txParams,
          transactionType,
          draftTransaction.history,
        ),
      );
    }
  };
}

/**
 * Toggles the amount.mode between INPUT and MAX modes.
 * As a result, the amount.value will change to either '0x0' when moving from
 * MAX to INPUT, or to the maximum allowable amount based on current asset when
 * moving from INPUT to MAX.
 *
 * @returns {ThunkAction<void>}
 */
export function toggleSendMaxMode() {
  return async (dispatch, getState) => {
    const state = getState();
    if (state[name].amountMode === AMOUNT_MODES.MAX) {
      await dispatch(actions.updateAmountMode(AMOUNT_MODES.INPUT));
      await dispatch(actions.updateSendAmount('0x0'));
      await dispatch(addHistoryEntry(`sendFlow - user toggled max mode off`));
    } else {
      await dispatch(actions.updateAmountMode(AMOUNT_MODES.MAX));
      await dispatch(actions.updateAmountToMax());
      await dispatch(addHistoryEntry(`sendFlow - user toggled max mode on`));
    }
    await dispatch(computeEstimatedGasLimit());
  };
}

/**
 * Begins a new draft transaction, clearing out the previous draft transactions
 * from state, and clearing the currentTransactionUUID. This action is one of
 * the two entry points into the send flow. NOTE: You must route to the send
 * page *after* dispatching this action resolves to ensure that the
 * draftTransaction is properly created.
 *
 * @param {AssetModel} asset - A partial asset
 *  object containing at least the asset type. If specifying a non-native asset
 *  then the asset details must be included with at least the address.
 * @returns {ThunkAction<void>}
 */
export function startNewDraftTransaction(asset) {
  return async (dispatch) => {
    await dispatch(actions.clearPreviousDrafts());

    await dispatch(
      actions.addNewDraft({
        ...draftTransactionInitialState,
        history: [`sendFlow - User started new draft transaction`],
      }),
    );

    await dispatch(showLoadingIndication());

    await dispatch(updateSendAsset(asset));
    await dispatch(initializeSendState());

    await dispatch(hideLoadingIndication());
  };
}

export function startNewMultisignTransactions(asset) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(showLoadingIndication());
    await dispatch(actions.clearPreviousDrafts());

    const { id, type, details } = asset;

    const data = {
      isMultisign: true,
      subDetails: null,
      ...asset,
      type: type ?? AssetType.native,
    };

    await dispatch(
      actions.addNewDraft({
        ...draftTransactionInitialState,
        history: [`sendFlow - User started new draft transaction`],
        multisignId: id,
      }),
    );

    await dispatch(updateSendAsset(data));
    await dispatch(initializeSendState());

    const networks = state.metamask.usedNetworks || {};
    const network =
      networks.bitcoin?.network || networks.bitcoin_testnet?.network || {};
    const rate = Math.ceil((network?.lowFeePerKb || 6543) / 1024); // mediumFeePerKb | highFeePerKb

    let weight = 496;
    try {
      weight = await dispatch(
        multisignTransactionWeight({
          id,
          amount: details.balance,
          toAddress: details.account,
        }),
      );
    } catch (err) {
      console.error(
        '[START NEW MULTI-SIGNATURE TRANSACTION] get weight err',
        err.message,
      );
    }

    await dispatch(
      actions.updateGas({
        weight,
        rate,
      }),
    );

    await dispatch(hideLoadingIndication());
  };
}

/**
 * @param id - multisign ID from multisigner controller state[chainId | contract].multisigner map
 */
export function sendMultisignTransactions(id) {
  return async (dispatch, getState) => {
    try {
      await dispatch(showLoadingIndication());
      const state = getState();
      const draft =
        state.send.draftTransactions[state.send.currentTransactionUUID];

      if (!draft) {
        return;
      }

      const {
        recipient,
        gas,
        amount,
        asset: { details },
      } = draft;

      const payload = {
        id,
        amount: new Numeric(amount.value, 16).toNumber(),
        toAddress: recipient.address,
        fee: gas.fee || 0,
      };

      if (state.send.amountMode === AMOUNT_MODES.MAX) {
        const balance = Number(details.balance);
        const weight = await dispatch(multisignTransactionWeight(payload));
        const _fee = gas.rate * weight;
        payload.fee = _fee / 10 ** details.decimals;
        payload.amount = balance - _fee;
      }

      const txCreated = await dispatch(multisignTransactionCreate(payload));
    } catch (err) {
      console.error('[SEND] Error:', err);
    } finally {
      await dispatch(hideLoadingIndication());
    }
  };
}

// Selectors
/**
 * The following typedef is a shortcut for typing selectors below. It uses a
 * generic type, T, so that each selector can specify it's return type.
 *
 * @template T
 * @typedef {(state: MetaMaskState) => T} Selector
 */

/**
 * Selector that returns the current draft transaction's UUID.
 *
 * @type {Selector<string>}
 */
export function getCurrentTransactionUUID(state) {
  return state[name].currentTransactionUUID;
}

/**
 * Selector that returns the current draft transaction.
 *
 * @type {Selector<DraftTransaction>}
 */
export function getCurrentDraftTransaction(state) {
  return state[name].draftTransactions[getCurrentTransactionUUID(state)] ?? {};
}

/**
 * Selector that returns true if a draft transaction exists.
 *
 * @type {Selector<boolean>}
 */
export function getDraftTransactionExists(state) {
  const draftTransaction = getCurrentDraftTransaction(state);
  if (Object.keys(draftTransaction).length === 0) {
    return false;
  }
  return true;
}

// Gas selectors

/**
 * Selector that returns the current draft transaction's gasLimit.
 *
 * @type {Selector<?string>}
 */
export function getGasLimit(state) {
  return getCurrentDraftTransaction(state).gas?.gasLimit;
}

/**
 * Selector that returns the current draft transaction's gasPrice.
 *
 * @type {Selector<?string>}
 */
export function getGasPrice(state) {
  return getCurrentDraftTransaction(state).gas?.gasPrice;
}

/**
 * Selector that returns the current draft transaction's gasTotal.
 *
 * @type {Selector<?string>}
 */
export function getGasTotal(state) {
  return getCurrentDraftTransaction(state).gas?.gasTotal;
}

/**
 * Selector that returns the error, if present, for the gas fields.
 *
 * @type {Selector<?string>}
 */
export function gasFeeIsInError(state) {
  return Boolean(getCurrentDraftTransaction(state).gas?.error);
}

/**
 * Selector that returns the minimum gasLimit for the current network.
 *
 * @type {Selector<string>}
 */
export function getMinimumGasLimitForSend(state) {
  return state[name].gasLimitMinimum;
}

/**
 * Selector that returns the current draft transaction's gasLimit.
 *
 * @type {Selector<MapValuesToUnion<SendStateGasModes>>}
 */
export function getGasInputMode(state) {
  const { chainId } = getCurrentDraftTransaction(state);
  const isMainnet = chainId === CHAIN_IDS.MAINNET;
  const gasEstimateType = getGasEstimateType(state);
  const showAdvancedGasFields = getAdvancedInlineGasShown(state);
  if (state[name].gasIsSetInModal) {
    return GAS_INPUT_MODES.CUSTOM;
  }
  if ((!isMainnet && !process.env.IN_TEST) || showAdvancedGasFields) {
    return GAS_INPUT_MODES.INLINE;
  }

  // We get eth_gasPrice estimation if the legacy API fails but we need to
  // instruct the UI to render the INLINE inputs in this case, only on
  // mainnet or IN_TEST.
  if (
    (isMainnet || process.env.IN_TEST) &&
    gasEstimateType === GasEstimateTypes.ethGasPrice
  ) {
    return GAS_INPUT_MODES.INLINE;
  }
  return GAS_INPUT_MODES.BASIC;
}

// Asset Selectors
/**
 * Selector that returns the asset the current draft transaction is sending.
 *
 * @type {Selector<?Asset>}
 */
export function getSendAsset(state) {
  const { asset } = getCurrentDraftTransaction(state);
  return asset;
}

/**
 * Selector that returns the contract address of the non-native asset that
 * the current transaction is sending, if it exists.
 *
 * @type {Selector<?string>}
 */
export function getSendAssetAddress(state) {
  return getSendAsset(state)?.details?.address;
}

/**
 * Selector that returns a boolean value describing whether the currently
 * selected asset is sendable, based upon the standard of the token.
 *
 * @type {Selector<boolean>}
 */
export function getIsAssetSendable(state) {
  if (getSendAsset(state)?.type === AssetType.native) {
    return true;
  }
  return getSendAsset(state)?.details?.isERC721 === false;
}

/**
 * Selector that returns the asset error if it exists.
 *
 * @type {Selector<?string>}
 */
export function getAssetError(state) {
  return getSendAsset(state).error;
}

// Amount Selectors
/**
 * Selector that returns the amount that current draft transaction is sending.
 *
 * @type {Selector<?string>}
 */
export function getSendAmount(state) {
  return getCurrentDraftTransaction(state).amount?.value;
}

/**
 * Selector that returns true if the user has enough native asset balance to
 * cover the cost of the transaction.
 *
 * @type {Selector<boolean>}
 */
export function getIsBalanceInsufficient(state) {
  return (
    getCurrentDraftTransaction(state).gas?.error === INSUFFICIENT_FUNDS_ERROR
  );
}

/**
 * Selector that returns the amoung send mode, either MAX or INPUT.
 *
 * @type {Selector<boolean>}
 */
export function getSendMaxModeState(state) {
  return state[name].amountMode === AMOUNT_MODES.MAX;
}

/**
 * Selector that returns the current draft transaction's data field.
 *
 * @type {Selector<?string>}
 */
export function getSendHexData(state) {
  return getCurrentDraftTransaction(state).userInputHexData;
}

/**
 * Selector that returns the current draft transaction's id, if present.
 *
 * @type {Selector<?string>}
 */
export function getDraftTransactionID(state) {
  return getCurrentDraftTransaction(state).id;
}

/**
 * Selector that returns true if there is an error on the amount field.
 *
 * @type {Selector<boolean>}
 */
export function sendAmountIsInError(state) {
  return Boolean(getCurrentDraftTransaction(state).amount?.error);
}

// Recipient Selectors
/**
 * Selector that returns the current draft transaction's recipient.
 *
 * @type {Selector<DraftTransaction['recipient']>}
 */
export function getRecipient(state) {
  const draft = getCurrentDraftTransaction(state);
  if (!draft.recipient) {
    return {
      address: '',
      nickname: '',
      error: null,
      warning: null,
    };
  }
  const checksummedAddress = toChecksumHexAddress(draft.recipient.address);
  if (state.metamask.ensResolutionsByAddress) {
    return {
      ...draft.recipient,
      nickname:
        draft.recipient.nickname ||
        getEnsResolutionByAddress(state, checksummedAddress),
    };
  }
  return draft.recipient;
}

/**
 * Selector that returns the addres of the current draft transaction's
 * recipient.
 *
 * @type {Selector<?string>}
 */
export function getSendTo(state) {
  return getRecipient(state)?.address;
}

/**
 * Selector that returns true if the current recipientMode is MY_ACCOUNTS
 *
 * @type {Selector<boolean>}
 */
export function getIsUsingMyAccountForRecipientSearch(state) {
  return state[name].recipientMode === RECIPIENT_SEARCH_MODES.MY_ACCOUNTS;
}

/**
 * Selector that returns the value that the user has typed into the recipient
 * input field.
 *
 * @type {Selector<?string>}
 */
export function getRecipientUserInput(state) {
  return state[name].recipientInput;
}

export function getRecipientWarningAcknowledgement(state) {
  return (
    getCurrentDraftTransaction(state).recipient?.recipientWarningAcknowledged ??
    false
  );
}

// Overall validity and stage selectors

/**
 * Selector that returns the gasFee and amount errors, if they exist.
 *
 * @type {Selector<{ gasFee?: string, amount?: string}>}
 */
export function getSendErrors(state) {
  return {
    gasFee: getCurrentDraftTransaction(state).gas?.error,
    amount: getCurrentDraftTransaction(state).amount?.error,
  };
}

/**
 * Selector that returns true if the stage is anything except INACTIVE
 *
 * @type {Selector<boolean>}
 */
export function isSendStateInitialized(state) {
  return state[name].stage !== SEND_STAGES.INACTIVE;
}

/**
 * Selector that returns true if the current draft transaction is valid and in
 * a sendable state.
 *
 * @type {Selector<boolean>}
 */
export function isSendFormInvalid(state) {
  const tx = getCurrentDraftTransaction(state);
  return (
    // !tx || tx.status === SEND_STATUSES.INVALID || !Number(tx?.amount?.value)
    !tx || tx.status === SEND_STATUSES.INVALID
  );
}

/**
 * Selector that returns the current stage of the send flow
 *
 * @type {Selector<MapValuesToUnion<SendStateStages>>}
 */
export function getSendStage(state) {
  return state[name].stage;
}

export const getTransactionParams = (state) =>
  generateTransactionParams(state[name]);
