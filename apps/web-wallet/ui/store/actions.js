import log from 'loglevel';
import { captureException } from '@sentry/browser';
import { capitalize, isEqual } from 'lodash';
import { getMethodDataAsync } from '../helpers/utils/transactions.util';
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ORIGIN_METAMASK,
  POLLING_TOKEN_ENVIRONMENT_TYPES,
  MESSAGE_TYPE,
} from '../../shared/constants/app';
import { hasUnconfirmedTransactions } from '../helpers/utils/confirm-tx.util';
import txHelper from '../helpers/utils/tx-helper';
import { getEnvironmentType, addHexPrefix } from '../../app/scripts/lib/util';
import {
  getMetaMaskAccounts,
  getPermittedAccountsForCurrentTab,
  getSelectedAddress,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // getNotifications,
  ///: END:ONLY_INCLUDE_IN
} from '../selectors';
import {
  computeEstimatedGasLimit,
  initializeSendState,
  resetSendState,
  startNewDraftTransaction,
} from '../ducks/send';
import { switchedToUnconnectedAccount } from '../ducks/alerts/unconnected-account';
import { getUnconnectedAccountAlertEnabledness } from '../ducks/metamask/metamask';
import { toChecksumHexAddress } from '../../shared/modules/hexstring-utils';
import {
  HardwareDeviceNames,
  LedgerTransportTypes,
  LEDGER_USB_VENDOR_ID,
} from '../../shared/constants/hardware-wallets';
import { EVENT } from '../../shared/constants/metametrics';
import { parseSmartTransactionsError } from '../pages/swaps/swaps.util';
///: BEGIN:ONLY_INCLUDE_IN(flask)
import { NOTIFICATIONS_EXPIRATION_DELAY } from '../helpers/constants/notifications';
///: END:ONLY_INCLUDE_IN
import {
  fetchLocale,
  loadRelativeTimeFormatLocaleData,
} from '../helpers/utils/i18n-helper';
import { decimalToHex } from '../../shared/modules/conversion.utils';
import { AssetModel } from '../../shared/lib/asset-model';
import { setSwapsFromToken } from '../ducks/swaps/swaps';
import { logErrorWithMessage } from '../../shared/modules/error';
import * as actionConstants from './actionConstants';
import {
  generateActionId,
  callBackgroundMethod,
  submitRequestToBackground,
} from './action-queue';

export function goHome() {
  return {
    type: actionConstants.GO_HOME,
  };
}

// async actions

export function handleBackgroundSubmit(
  submitFunctionName,
  { showLoading, args },
) {
  return async (dispatch) => {
    if (showLoading) {
      dispatch(showLoadingIndication());
    }
    try {
      const response = await submitRequestToBackground(
        submitFunctionName,
        args,
      );
      return response;
    } catch (error) {
      dispatch(showModal({ name: 'ALERT', text: error.message }));
      throw new Error(error.message);
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function tryUnlockMetamask(password) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    dispatch(unlockInProgress());
    log.debug(`background.submitPassword`);

    return new Promise((resolve, reject) => {
      callBackgroundMethod('submitPassword', [password], (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    })
      .then(() => {
        dispatch(unlockSucceeded());
        return forceUpdateMetamaskState(dispatch);
      })
      .then(() => {
        dispatch(hideLoadingIndication());
      })
      .catch((err) => {
        dispatch(unlockFailed(err.message));
        dispatch(hideLoadingIndication());
        return Promise.reject(err);
      });
  };
}

/**
 * Adds a new account where all data is encrypted using the given password and
 * where all addresses are generated from a given seed phrase.
 *
 * @param {string} password - The password.
 * @param {string} seedPhrase - The seed phrase.
 * @returns {object} The updated state of the keyring controller.
 */
export function createNewVaultAndRestore(password, seedPhrase) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.createNewVaultAndRestore`);
    // Encode the secret recovery phrase as an array of integers so that it is
    // serialized as JSON properly.
    const encodedSeedPhrase = Array.from(
      Buffer.from(seedPhrase, 'utf8').values(),
    );

    let vault;
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'createNewVaultAndRestore',
        [password, encodedSeedPhrase],
        (err, _vault) => {
          if (err) {
            reject(err);
            return;
          }
          vault = _vault;
          resolve();
        },
      );
    })
      .then(() => dispatch(unMarkPasswordForgotten()))
      .then(() => {
        dispatch(showAccountsPage());
        dispatch(hideLoadingIndication());
        return vault;
      })
      .catch((err) => {
        dispatch(displayWarning(err.message));
        dispatch(hideLoadingIndication());
        return Promise.reject(err);
      });
  };
}

export function createNewVaultAndGetSeedPhrase(password) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    try {
      await createNewVault(password);
      const seedPhrase = await verifySeedPhrase();
      return seedPhrase;
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw new Error(error.message);
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function unlockAndGetSeedPhrase(password) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    try {
      await submitPassword(password);
      const seedPhrase = await verifySeedPhrase();
      await forceUpdateMetamaskState(dispatch);
      return seedPhrase;
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw new Error(error.message);
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function submitPassword(password) {
  return new Promise((resolve, reject) => {
    callBackgroundMethod('submitPassword', [password], (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function createNewVault(password) {
  return new Promise((resolve, reject) => {
    callBackgroundMethod('createNewVaultAndKeychain', [password], (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(true);
    });
  });
}

export function verifyPassword(password) {
  return new Promise((resolve, reject) => {
    callBackgroundMethod('verifyPassword', [password], (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(true);
    });
  });
}

export async function verifySeedPhrase() {
  const encodedSeedPhrase = await submitRequestToBackground('verifySeedPhrase');
  return Buffer.from(encodedSeedPhrase).toString('utf8');
}

export function requestRevealSeedWords(password) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.verifyPassword`);

    try {
      await verifyPassword(password);
      const seedPhrase = await verifySeedPhrase();
      return seedPhrase;
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function tryReverseResolveAddress(address) {
  return () => {
    return new Promise((resolve) => {
      callBackgroundMethod('tryReverseResolveAddress', [address], (err) => {
        if (err) {
          log.error(err);
        }
        resolve();
      });
    });
  };
}

export function fetchInfoToSync() {
  return (dispatch) => {
    log.debug(`background.fetchInfoToSync`);
    return new Promise((resolve, reject) => {
      callBackgroundMethod('fetchInfoToSync', [], (err, result) => {
        if (err) {
          dispatch(displayWarning(err.message));
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  };
}

export function resetAccount() {
  return (dispatch) => {
    dispatch(showLoadingIndication());

    return new Promise((resolve, reject) => {
      callBackgroundMethod('resetAccount', [], (err, account) => {
        dispatch(hideLoadingIndication());
        if (err) {
          dispatch(displayWarning(err.message));
          reject(err);
          return;
        }

        log.info(`Transaction history reset for ${account}`);
        dispatch(showAccountsPage());
        resolve(account);
      });
    });
  };
}

export function removeAccount(address) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    try {
      await new Promise((resolve, reject) => {
        callBackgroundMethod('removeAccount', [address], (error, account) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(account);
        });
      });
      await forceUpdateMetamaskState(dispatch);
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    log.info(`Account removed: ${address}`);
    dispatch(showAccountsPage());
  };
}

export function importNewAccount(strategy, args) {
  return async (dispatch) => {
    let newState;
    dispatch(
      showLoadingIndication('This may take a while, please be patient.'),
    );
    try {
      log.debug(`background.importAccountWithStrategy`);
      await submitRequestToBackground('importAccountWithStrategy', [
        strategy,
        args,
      ]);
      log.debug(`background.getState`);
      newState = await submitRequestToBackground('getState');
    } catch (err) {
      dispatch(displayWarning(err.message));
      throw err;
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    return newState;
  };
}

export function addNewAccount(seedPhrase) {
  log.debug(`background.addNewAccount`);
  return async (dispatch, getState) => {
    const oldIdentities = { ...getState().metamask.identities };
    dispatch(showLoadingIndication());

    let newIdentities;
    try {
      const { identities } = await submitRequestToBackground('addNewAccount', [
        seedPhrase,
      ]);
      newIdentities = identities;
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    const newAccountAddress = Object.keys(newIdentities).find(
      (address) => !oldIdentities[address],
    );
    await forceUpdateMetamaskState(dispatch);
    return newAccountAddress;
  };
}

export function checkHardwareStatus(deviceName, hdPath) {
  log.debug(`background.checkHardwareStatus`, deviceName, hdPath);
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    let unlocked;
    try {
      unlocked = await submitRequestToBackground('checkHardwareStatus', [
        deviceName,
        hdPath,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    await forceUpdateMetamaskState(dispatch);
    return unlocked;
  };
}

export function forgetDevice(deviceName) {
  log.debug(`background.forgetDevice`, deviceName);
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      await submitRequestToBackground('forgetDevice', [deviceName]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    await forceUpdateMetamaskState(dispatch);
  };
}

export function setDisabledRpcMethodPreference(methodName, value) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    await submitRequestToBackground('setDisabledRpcMethodPreference', [
      methodName,
      value,
    ]);
    dispatch(hideLoadingIndication());
  };
}

export function editAndSetNetworkConfiguration(
  { networkConfigurationId, rpcUrl, chainId, nickname, rpcPrefs, ticker },
  { source },
) {
  return async (dispatch) => {
    log.debug(
      `background.removeNetworkConfiguration: ${networkConfigurationId}`,
    );
    try {
      await submitRequestToBackground('removeNetworkConfiguration', [
        networkConfigurationId,
      ]);
    } catch (error) {
      logErrorWithMessage(error);
      dispatch(displayWarning('Had a problem removing network!'));
      return;
    }

    try {
      await submitRequestToBackground('upsertNetworkConfiguration', [
        {
          rpcUrl,
          chainId,
          ticker,
          nickname: nickname || rpcUrl,
          rpcPrefs,
        },
        { setActive: true, referrer: ORIGIN_METAMASK, source },
      ]);
    } catch (error) {
      logErrorWithMessage(error);
      dispatch(displayWarning('Had a problem changing networks!'));
    }
  };
}

export function removeNetworkConfiguration(networkConfigurationId) {
  return (dispatch) => {
    log.debug(
      `background.removeNetworkConfiguration: ${networkConfigurationId}`,
    );
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'removeNetworkConfiguration',
        [networkConfigurationId],
        (err) => {
          if (err) {
            logErrorWithMessage(err);
            dispatch(displayWarning('Had a problem removing network!'));
            reject(err);
            return;
          }
          resolve();
        },
      );
    });
  };
}

export function setActiveNetwork(networkConfigurationId) {
  return async (dispatch) => {
    log.debug(`background.setActiveNetwork: ${networkConfigurationId}`);
    try {
      await submitRequestToBackground('setActiveNetwork', [
        networkConfigurationId,
      ]);
    } catch (error) {
      dispatch(displayWarning('Had a problem changing networks!'));
    }
  };
}

export function upsertNetworkConfiguration(
  { rpcUrl, chainId, nickname, rpcPrefs, ticker },
  { setActive, source },
) {
  return async (dispatch) => {
    log.debug(
      `background.upsertNetworkConfiguration: ${rpcUrl} ${chainId} ${ticker} ${nickname}`,
    );
    let networkConfigurationId;
    try {
      networkConfigurationId = await submitRequestToBackground(
        'upsertNetworkConfiguration',
        [
          { rpcUrl, chainId, ticker, nickname: nickname || rpcUrl, rpcPrefs },
          { setActive, source, referrer: ORIGIN_METAMASK },
        ],
      );
    } catch (error) {
      log.error(error);
      dispatch(displayWarning('Had a problem adding network!'));
    }
    return networkConfigurationId;
  };
}

export function setSelectedNetworkConfigurationId(networkConfigurationId) {
  return {
    type: actionConstants.SET_SELECTED_NETWORK_CONFIGURATION_ID,
    payload: networkConfigurationId,
  };
}

export function setNewNetworkAdded({ networkConfigurationId, nickname }) {
  return {
    type: actionConstants.SET_NEW_NETWORK_ADDED,
    payload: { networkConfigurationId, nickname },
  };
}

export function connectHardware(deviceName, page, hdPath, t) {
  log.debug(`background.connectHardware`, deviceName, page, hdPath);
  return async (dispatch, getState) => {
    const { ledgerTransportType } = getState().metamask;

    dispatch(
      showLoadingIndication(`Looking for your ${capitalize(deviceName)}...`),
    );

    let accounts;
    try {
      if (deviceName === HardwareDeviceNames.ledger) {
        await submitRequestToBackground('establishLedgerTransportPreference');
      }
      if (
        deviceName === HardwareDeviceNames.ledger &&
        ledgerTransportType === LedgerTransportTypes.webhid
      ) {
        const connectedDevices = await window.navigator.hid.requestDevice({
          filters: [{ vendorId: LEDGER_USB_VENDOR_ID }],
        });
        const userApprovedWebHidConnection = connectedDevices.some(
          (device) => device.vendorId === Number(LEDGER_USB_VENDOR_ID),
        );
        if (!userApprovedWebHidConnection) {
          throw new Error(t('ledgerWebHIDNotConnectedErrorMessage'));
        }
      }

      accounts = await submitRequestToBackground('connectHardware', [
        deviceName,
        page,
        hdPath,
      ]);
    } catch (error) {
      log.error(error);
      if (
        deviceName === HardwareDeviceNames.ledger &&
        ledgerTransportType === LedgerTransportTypes.webhid &&
        error.message.match('Failed to open the device')
      ) {
        dispatch(displayWarning(t('ledgerDeviceOpenFailureMessage')));
        throw new Error(t('ledgerDeviceOpenFailureMessage'));
      } else {
        if (deviceName !== HardwareDeviceNames.qr) {
          dispatch(displayWarning(error.message));
        }
        throw error;
      }
    } finally {
      dispatch(hideLoadingIndication());
    }

    await forceUpdateMetamaskState(dispatch);
    return accounts;
  };
}

export function unlockHardwareWalletAccounts(
  indexes,
  deviceName,
  hdPath,
  hdPathDescription,
) {
  log.debug(
    `background.unlockHardwareWalletAccount`,
    indexes,
    deviceName,
    hdPath,
    hdPathDescription,
  );
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    for (const index of indexes) {
      try {
        await submitRequestToBackground('unlockHardwareWalletAccount', [
          index,
          deviceName,
          hdPath,
          hdPathDescription,
        ]);
      } catch (e) {
        log.error(e);
        dispatch(displayWarning(e.message));
        dispatch(hideLoadingIndication());
        throw e;
      }
    }

    dispatch(hideLoadingIndication());
    return undefined;
  };
}

export function showQrScanner() {
  return (dispatch) => {
    dispatch(
      showModal({
        name: 'QR_SCANNER',
      }),
    );
  };
}

export function setCurrentCurrency(currencyCode) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setCurrentCurrency`);
    try {
      await submitRequestToBackground('setCurrentCurrency', [currencyCode]);
      await forceUpdateMetamaskState(dispatch);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      return;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function signMsg(msgData) {
  log.debug('action - signMsg');
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`actions calling background.signMessage`);
    let newState;
    try {
      newState = await submitRequestToBackground('signMessage', [msgData]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.metamaskId));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function signPersonalMsg(msgData) {
  log.debug('action - signPersonalMsg');
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`actions calling background.signPersonalMessage`);

    let newState;
    try {
      newState = await submitRequestToBackground('signPersonalMessage', [
        msgData,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.metamaskId));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function decryptMsgInline(decryptedMsgData) {
  log.debug('action - decryptMsgInline');
  return async (dispatch) => {
    log.debug(`actions calling background.decryptMessageInline`);

    let newState;
    try {
      newState = await submitRequestToBackground('decryptMessageInline', [
        decryptedMsgData,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    }

    dispatch(updateMetamaskState(newState));
    return newState.unapprovedDecryptMsgs[decryptedMsgData.metamaskId];
  };
}

export function decryptMsg(decryptedMsgData) {
  log.debug('action - decryptMsg');
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`actions calling background.decryptMessage`);

    let newState;
    try {
      newState = await submitRequestToBackground('decryptMessage', [
        decryptedMsgData,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(decryptedMsgData.metamaskId));
    dispatch(closeCurrentNotificationWindow());
    return decryptedMsgData;
  };
}

export function encryptionPublicKeyMsg(msgData) {
  log.debug('action - encryptionPublicKeyMsg');
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`actions calling background.encryptionPublicKey`);

    let newState;
    try {
      newState = await submitRequestToBackground('encryptionPublicKey', [
        msgData,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.metamaskId));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function signTypedMsg(msgData) {
  log.debug('action - signTypedMsg');
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`actions calling background.signTypedMessage`);

    let newState;
    try {
      newState = await submitRequestToBackground('signTypedMessage', [msgData]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.metamaskId));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function updateCustomNonce(value) {
  return {
    type: actionConstants.UPDATE_CUSTOM_NONCE,
    value,
  };
}

const updateMetamaskStateFromBackground = () => {
  log.debug(`background.getState`);

  return new Promise((resolve, reject) => {
    callBackgroundMethod('getState', [], (error, newState) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(newState);
    });
  });
};

export function updatePreviousGasParams(txId, previousGasParams) {
  return async (dispatch) => {
    let updatedTransaction;
    try {
      updatedTransaction = await submitRequestToBackground(
        'updatePreviousGasParams',
        [txId, previousGasParams],
      );
    } catch (error) {
      dispatch(txError(error));
      log.error(error.message);
      throw error;
    }

    return updatedTransaction;
  };
}

export function updateSwapApprovalTransaction(txId, txSwapApproval) {
  return async (dispatch) => {
    let updatedTransaction;
    try {
      updatedTransaction = await submitRequestToBackground(
        'updateSwapApprovalTransaction',
        [txId, txSwapApproval],
      );
    } catch (error) {
      dispatch(txError(error));
      log.error(error.message);
      throw error;
    }

    return updatedTransaction;
  };
}

export function updateEditableParams(txId, editableParams) {
  return async (dispatch) => {
    let updatedTransaction;
    try {
      updatedTransaction = await submitRequestToBackground(
        'updateEditableParams',
        [txId, editableParams],
      );
    } catch (error) {
      dispatch(txError(error));
      log.error(error.message);
      throw error;
    }
    await forceUpdateMetamaskState(dispatch);
    return updatedTransaction;
  };
}

/**
 * Appends new send flow history to a transaction
 *
 * @param {string} txId - the id of the transaction to update
 * @param {number} currentSendFlowHistoryLength - sendFlowHistory entries currently
 * @param {Array<{event: string, timestamp: number}>} sendFlowHistory - the new send flow history to append to the
 *  transaction
 * @returns {import('../../shared/constants/transaction').TransactionMeta}
 */
export function updateTransactionSendFlowHistory(
  txId,
  currentSendFlowHistoryLength,
  sendFlowHistory,
) {
  return async (dispatch) => {
    let updatedTransaction;
    try {
      updatedTransaction = await submitRequestToBackground(
        'updateTransactionSendFlowHistory',
        [txId, currentSendFlowHistoryLength, sendFlowHistory],
      );
    } catch (error) {
      dispatch(txError(error));
      log.error(error.message);
      throw error;
    }

    return updatedTransaction;
  };
}

/**
 * @param asset
 * @param options
 * @deprecated Use assetModel in selectors.js
 */
export function getAssetModel(asset, options) {
  return (dispatch, getState) => {
    let assetModel;
    const api = {
      ignoreTokens: (...opts) => dispatch(ignoreTokens(...opts)),
      addToken: (...opts) => dispatch(addToken(...opts)),
      dextradeRequest: (...opts) => dispatch(dextradeRequest(...opts)),
      startNewDraftTransaction: (...opts) =>
        dispatch(startNewDraftTransaction(...opts)),
      setSwapsFromToken: (...opts) => dispatch(setSwapsFromToken(...opts)),
    };
    try {
      assetModel = new AssetModel(asset, {
        getState: () => getState().metamask,
        api,
        ...options,
      });
    } catch (error) {
      dispatch(txError(error));
      log.error(error.message);
      throw error;
    }

    return assetModel;
  };
}

export async function backupUserData() {
  let backedupData;
  try {
    backedupData = await submitRequestToBackground('backupUserData');
  } catch (error) {
    log.error(error.message);
    throw error;
  }

  return backedupData;
}

export async function restoreUserData(jsonString) {
  try {
    await submitRequestToBackground('restoreUserData', [jsonString]);
  } catch (error) {
    log.error(error.message);
    throw error;
  }

  return true;
}

export function updateTransactionGasFees(txId, txGasFees) {
  return async (dispatch) => {
    let updatedTransaction;
    try {
      updatedTransaction = await submitRequestToBackground(
        'updateTransactionGasFees',
        [txId, txGasFees],
      );
    } catch (error) {
      dispatch(txError(error));
      log.error(error.message);
      throw error;
    }

    return updatedTransaction;
  };
}

export function updateSwapTransaction(txId, txSwap) {
  return async (dispatch) => {
    let updatedTransaction;
    try {
      updatedTransaction = await submitRequestToBackground(
        'updateSwapTransaction',
        [txId, txSwap],
      );
    } catch (error) {
      dispatch(txError(error));
      log.error(error.message);
      throw error;
    }

    return updatedTransaction;
  };
}

export function updateTransaction(txData, dontShowLoadingIndicator) {
  return async (dispatch) => {
    !dontShowLoadingIndicator && dispatch(showLoadingIndication());

    try {
      await submitRequestToBackground('updateTransaction', [txData]);
    } catch (error) {
      dispatch(updateTransactionParams(txData.id, txData.txParams));
      dispatch(hideLoadingIndication());
      dispatch(txError(error));
      dispatch(goHome());
      log.error(error.message);
      throw error;
    }

    try {
      dispatch(updateTransactionParams(txData.id, txData.txParams));
      const newState = await updateMetamaskStateFromBackground();
      dispatch(updateMetamaskState(newState));
      dispatch(showConfTxPage({ id: txData.id }));
      return txData;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

/**
 * Action to create a new transaction in the controller and route to the
 * confirmation page. Returns the newly created txMeta in case additional logic
 * should be applied to the transaction after creation.
 *
 * @param method
 * @param {import('../../shared/constants/transaction').TxParams} txParams -
 *  The transaction parameters
 * @param {import(
 *  '../../shared/constants/transaction'
 * ).TransactionType} type - The type of the transaction being added.
 * @param {Array<{event: string, timestamp: number}>} sendFlowHistory - The
 *  history of the send flow at time of creation.
 * @param {number} exchangeId - if it p2p exchange proccessing, pass the exchange id
 * @returns {import('../../shared/constants/transaction').TransactionMeta}
 */
export function addUnapprovedTransactionAndRouteToConfirmationPage(
  method,
  txParams,
  type,
  sendFlowHistory,
  exchangeId,
) {
  return async (dispatch) => {
    const actionId = generateActionId();
    dispatch(showLoadingIndication());
    try {
      log.debug('background.addUnapprovedTransaction');
      const txMeta = await submitRequestToBackground(
        'addUnapprovedTransaction',
        [
          method,
          txParams,
          ORIGIN_METAMASK,
          type,
          sendFlowHistory,
          actionId,
          exchangeId,
        ],
        actionId,
      );
      dispatch(showConfTxPage());
      return txMeta;
    } catch (error) {
      dispatch(displayWarning(error.message));
    }
    dispatch(hideLoadingIndication());
    return null;
  };
}

/**
 * Wrapper around the promisifedBackground to create a new unapproved
 * transaction in the background and return the newly created txMeta.
 * This method does not show errors or route to a confirmation page and is
 * used primarily for swaps functionality.
 *
 * @param method
 * @param {import('../../shared/constants/transaction').TxParams} txParams -
 *  The transaction parameters
 * @param {import(
 *  '../../shared/constants/transaction'
 * ).TransactionType} type - The type of the transaction being added.
 * @returns {import('../../shared/constants/transaction').TransactionMeta}
 */
export async function addUnapprovedTransaction(method, txParams, type) {
  log.debug('background.addUnapprovedTransaction');
  const actionId = generateActionId();
  const txMeta = await submitRequestToBackground(
    'addUnapprovedTransaction',
    [method, txParams, ORIGIN_METAMASK, type, undefined, actionId],
    actionId,
  );
  return txMeta;
}

export function emulateTransaction({ sendToken, amount, destinationAddress }) {
  return () => {
    const actionId = generateActionId();
    return submitRequestToBackground('emulateTransaction', [
      sendToken,
      amount,
      destinationAddress,
      ORIGIN_METAMASK,
      actionId,
    ]);
  };
}

export function createDextradeSwapTransaction(params, options) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    const actionId = params?.id || generateActionId();
    return submitRequestToBackground('createDextradeSwapTransaction', [
      actionId,
      params,
      options,
    ]).finally((data) => {
      dispatch(hideLoadingIndication());
      return data;
    });
  };
}
export function updateAndApproveTransaction(txData, actionId) {
  return async () => {
    return submitRequestToBackground('updateAndApproveTransaction', [
      txData,
      actionId,
    ]);
  };
}

export function createUnapprovedTransaction({
  sendToken,
  amount,
  destinationAddress,
  txSwap,
  dontShowLoadingIndicator,
  emulate,
}) {
  return async (dispatch) => {
    !dontShowLoadingIndicator && dispatch(showLoadingIndication());
    const actionId = generateActionId();
    return submitRequestToBackground('createUnapprovedTransaction', [
      sendToken,
      amount,
      destinationAddress,
      txSwap,
      ORIGIN_METAMASK,
      actionId,
      emulate,
    ])
      .then((txMeta) => {
        dispatch(hideLoadingIndication());
        return txMeta;
      })
      .catch((e) => {
        dispatch(hideLoadingIndication());
        return new Error(e);
      });
  };
}

export function getAccountAddressByProvider(provider) {
  return async () => {
    return submitRequestToBackground('getAccountAddressByProvider', [provider]);
  };
}

export function updateAndApproveTx(
  txData,
  dontShowLoadingIndicator,
  redirected = true,
) {
  return (dispatch) => {
    !dontShowLoadingIndicator && dispatch(showLoadingIndication());
    return new Promise((resolve, reject) => {
      const actionId = generateActionId();
      callBackgroundMethod(
        'updateAndApproveTransaction',
        [txData, actionId],
        (err) => {
          dispatch(updateTransactionParams(txData.id, txData.txParams));
          dispatch(resetSendState());

          if (err) {
            dispatch(txError(err));
            redirected && dispatch(goHome());
            log.error(err.message);
            reject(err);
            return;
          }

          resolve(txData);
        },
      );
    })
      .then(() => updateMetamaskStateFromBackground())
      .then(
        (newState) =>
          console.log(newState) && dispatch(updateMetamaskState(newState)),
      ) // TODO: ??
      .then(() => {
        dispatch(resetSendState());
        dispatch(completedTx(txData.id));
        dispatch(hideLoadingIndication());
        dispatch(closeCurrentNotificationWindow());
        dispatch(updateCustomNonce(''));

        return txData;
      })
      .catch((err) => {
        dispatch(hideLoadingIndication());
        return Promise.reject(err);
      });
  };
}

export async function getTransactions(filters = {}) {
  return await submitRequestToBackground('getTransactions', [filters]);
}

export function completedTx(id) {
  return (dispatch, getState) => {
    const state = getState();
    const {
      unapprovedTxs,
      unapprovedMsgs,
      unapprovedPersonalMsgs,
      unapprovedTypedMessages,
      network,
      provider: { chainId },
    } = state.metamask;
    const unconfirmedActions = txHelper(
      unapprovedTxs,
      unapprovedMsgs,
      unapprovedPersonalMsgs,
      unapprovedTypedMessages,
      network,
      chainId,
    );
    const otherUnconfirmedActions = unconfirmedActions.filter(
      (tx) => tx.id !== id,
    );
    dispatch({
      type: actionConstants.COMPLETED_TX,
      value: {
        id,
        unconfirmedActionsCount: otherUnconfirmedActions.length,
      },
    });
  };
}

export function updateTransactionParams(id, txParams) {
  return {
    type: actionConstants.UPDATE_TRANSACTION_PARAMS,
    id,
    value: txParams,
  };
}

export function txError(err) {
  return {
    type: actionConstants.TRANSACTION_ERROR,
    message: err.message,
  };
}

///: BEGIN:ONLY_INCLUDE_IN(flask)
export function disableSnap(snapId) {
  return async (dispatch) => {
    await submitRequestToBackground('disableSnap', [snapId]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function enableSnap(snapId) {
  return async (dispatch) => {
    await submitRequestToBackground('enableSnap', [snapId]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function removeSnap(snapId) {
  return async (dispatch) => {
    await submitRequestToBackground('removeSnap', [snapId]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export async function removeSnapError(msgData) {
  return submitRequestToBackground('removeSnapError', [msgData]);
}

export async function handleSnapRequest(args) {
  return submitRequestToBackground('handleSnapRequest', [args]);
}

export function dismissNotifications(ids) {
  return async (dispatch) => {
    await submitRequestToBackground('dismissNotifications', [ids]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function deleteExpiredNotifications() {
  return async (dispatch, getState) => {
    const state = getState();
    const notifications = getNotifications(state);

    const notificationIdsToDelete = notifications
      .filter((notification) => {
        const expirationTime = new Date(
          Date.now() - NOTIFICATIONS_EXPIRATION_DELAY,
        );

        return Boolean(
          notification.readDate &&
            new Date(notification.readDate) < expirationTime,
        );
      })
      .map(({ id }) => id);
    if (notificationIdsToDelete.length) {
      await submitRequestToBackground('dismissNotifications', [
        notificationIdsToDelete,
      ]);
      await forceUpdateMetamaskState(dispatch);
    }
  };
}

export function markNotificationsAsRead(ids) {
  return async (dispatch) => {
    await submitRequestToBackground('markNotificationsAsRead', [ids]);
    await forceUpdateMetamaskState(dispatch);
  };
}
///: END:ONLY_INCLUDE_IN

export function cancelMsg(msgData) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    let newState;
    try {
      newState = await submitRequestToBackground('cancelMessage', [msgData.id]);
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.id));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

/**
 * Cancels all of the given messages
 *
 * @param {Array<object>} msgDataList - a list of msg data objects
 * @returns {function(*): Promise<void>}
 */
export function cancelMsgs(msgDataList) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    try {
      const msgIds = msgDataList.map((id) => id);
      const cancellations = msgDataList.map(
        ({ id, type }) =>
          new Promise((resolve, reject) => {
            switch (type) {
              case MESSAGE_TYPE.ETH_SIGN_TYPED_DATA:
                callBackgroundMethod('cancelTypedMessage', [id], (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  resolve();
                });
                return;
              case MESSAGE_TYPE.PERSONAL_SIGN:
                callBackgroundMethod('cancelPersonalMessage', [id], (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  resolve();
                });
                return;
              case MESSAGE_TYPE.ETH_DECRYPT:
                callBackgroundMethod('cancelDecryptMessage', [id], (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  resolve();
                });
                return;
              case MESSAGE_TYPE.ETH_GET_ENCRYPTION_PUBLIC_KEY:
                callBackgroundMethod(
                  'cancelEncryptionPublicKey',
                  [id],
                  (err) => {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve();
                  },
                );
                return;
              case MESSAGE_TYPE.ETH_SIGN:
                callBackgroundMethod('cancelMessage', [id], (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  resolve();
                });
                return;
              default:
                reject(
                  new Error(
                    `MetaMask Message Signature: Unknown message type: ${id}`,
                  ),
                );
            }
          }),
      );

      await Promise.all(cancellations);
      const newState = await updateMetamaskStateFromBackground();
      dispatch(updateMetamaskState(newState));

      msgIds.forEach((id) => {
        dispatch(completedTx(id));
      });
    } catch (err) {
      log.error(err);
    } finally {
      if (getEnvironmentType() === ENVIRONMENT_TYPE_NOTIFICATION) {
        closeNotificationPopup();
      } else {
        dispatch(hideLoadingIndication());
      }
    }
  };
}

export function cancelPersonalMsg(msgData) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    let newState;
    try {
      newState = await submitRequestToBackground('cancelPersonalMessage', [
        msgData.id,
      ]);
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.id));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function cancelDecryptMsg(msgData) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    let newState;
    try {
      newState = await submitRequestToBackground('cancelDecryptMessage', [
        msgData.id,
      ]);
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.id));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function cancelEncryptionPublicKeyMsg(msgData) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    let newState;
    try {
      newState = await submitRequestToBackground('cancelEncryptionPublicKey', [
        msgData.id,
      ]);
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.id));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function cancelTypedMsg(msgData) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    let newState;
    try {
      newState = await submitRequestToBackground('cancelTypedMessage', [
        msgData.id,
      ]);
    } finally {
      dispatch(hideLoadingIndication());
    }

    dispatch(updateMetamaskState(newState));
    dispatch(completedTx(msgData.id));
    dispatch(closeCurrentNotificationWindow());
    return msgData;
  };
}

export function cancelTx(txData, _showLoadingIndication = true) {
  return (dispatch) => {
    _showLoadingIndication && dispatch(showLoadingIndication());
    return new Promise((resolve, reject) => {
      const actionId = generateActionId();
      callBackgroundMethod(
        'cancelTransaction',
        [txData.id, actionId],
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    })
      .then(() => updateMetamaskStateFromBackground())
      .then(
        (newState) =>
          console.log(newState) && dispatch(updateMetamaskState(newState)),
      ) // TODO: ??
      .then(() => {
        dispatch(resetSendState());
        dispatch(completedTx(txData.id));
        dispatch(hideLoadingIndication());
        dispatch(closeCurrentNotificationWindow());

        return txData;
      })
      .catch((error) => {
        dispatch(hideLoadingIndication());
        throw error;
      });
  };
}

/**
 * Cancels all of the given transactions
 *
 * @param {Array<object>} txDataList - a list of tx data objects
 * @returns {function(*): Promise<void>}
 */
export function cancelTxs(txDataList) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    try {
      const txIds = txDataList.map(({ id }) => id);
      const cancellations = txIds.map(
        (id) =>
          new Promise((resolve, reject) => {
            const actionId = generateActionId();
            callBackgroundMethod('cancelTransaction', [id, actionId], (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            });
          }),
      );

      await Promise.all(cancellations);

      const newState = await updateMetamaskStateFromBackground();
      dispatch(updateMetamaskState(newState));
      dispatch(resetSendState());

      txIds.forEach((id) => {
        dispatch(completedTx(id));
      });
    } finally {
      if (getEnvironmentType() === ENVIRONMENT_TYPE_NOTIFICATION) {
        closeNotificationPopup();
      } else {
        dispatch(hideLoadingIndication());
      }
    }
  };
}

export function markPasswordForgotten() {
  return async (dispatch) => {
    try {
      await new Promise((resolve, reject) => {
        callBackgroundMethod('markPasswordForgotten', [], (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    } finally {
      // TODO: handle errors
      dispatch(hideLoadingIndication());
      await forceUpdateMetamaskState(dispatch);
    }
  };
}

export function unMarkPasswordForgotten() {
  return (dispatch) => {
    return new Promise((resolve) => {
      callBackgroundMethod('unMarkPasswordForgotten', [], () => {
        resolve();
      });
    }).then(() => forceUpdateMetamaskState(dispatch));
  };
}

export function closeWelcomeScreen() {
  return {
    type: actionConstants.CLOSE_WELCOME_SCREEN,
  };
}

//
// unlock screen
//

export function unlockInProgress() {
  return {
    type: actionConstants.UNLOCK_IN_PROGRESS,
  };
}

export function unlockFailed(message) {
  return {
    type: actionConstants.UNLOCK_FAILED,
    value: message,
  };
}

export function unlockSucceeded(message) {
  return {
    type: actionConstants.UNLOCK_SUCCEEDED,
    value: message,
  };
}

export function updateMetamaskState(newState) {
  return (dispatch, getState) => {
    const { metamask: currentState } = getState();

    const { currentLocale, selectedAddress, provider } = currentState;
    const {
      currentLocale: newLocale,
      selectedAddress: newSelectedAddress,
      provider: newProvider,
    } = newState;

    if (currentLocale && newLocale && currentLocale !== newLocale) {
      dispatch(updateCurrentLocale(newLocale));
    }

    if (selectedAddress !== newSelectedAddress) {
      dispatch({ type: actionConstants.SELECTED_ADDRESS_CHANGED });
    }

    const newAddressBook = newState.addressBook?.[newProvider?.chainId] ?? {};
    const oldAddressBook = currentState.addressBook?.[provider?.chainId] ?? {};
    const newAccounts = getMetaMaskAccounts({ metamask: newState });
    const oldAccounts = getMetaMaskAccounts({ metamask: currentState });
    const newSelectedAccount = newAccounts[newSelectedAddress];
    const oldSelectedAccount = newAccounts[selectedAddress];
    // dispatch an ACCOUNT_CHANGED for any account whose balance or other
    // properties changed in this update
    Object.entries(oldAccounts).forEach(([address, oldAccount]) => {
      if (!isEqual(oldAccount, newAccounts[address])) {
        dispatch({
          type: actionConstants.ACCOUNT_CHANGED,
          payload: { account: newAccounts[address] },
        });
      }
    });
    // Also emit an event for the selected account changing, either due to a
    // property update or if the entire account changes.
    if (isEqual(oldSelectedAccount, newSelectedAccount) === false) {
      dispatch({
        type: actionConstants.SELECTED_ACCOUNT_CHANGED,
        payload: { account: newSelectedAccount },
      });
    }
    // We need to keep track of changing address book entries
    if (isEqual(oldAddressBook, newAddressBook) === false) {
      dispatch({
        type: actionConstants.ADDRESS_BOOK_UPDATED,
        payload: { addressBook: newAddressBook },
      });
    }

    // track when gasFeeEstimates change
    if (
      isEqual(currentState.gasFeeEstimates, newState.gasFeeEstimates) === false
    ) {
      dispatch({
        type: actionConstants.GAS_FEE_ESTIMATES_UPDATED,
        payload: {
          gasFeeEstimates: newState.gasFeeEstimates,
          gasEstimateType: newState.gasEstimateType,
        },
      });
    }
    dispatch({
      type: actionConstants.UPDATE_METAMASK_STATE,
      value: newState,
    });
    if (provider.chainId !== newProvider.chainId) {
      dispatch({
        type: actionConstants.CHAIN_CHANGED,
        payload: newProvider.chainId,
      });
      // We dispatch this action to ensure that the send state stays up to date
      // after the chain changes. This async thunk will fail gracefully in the
      // event that we are not yet on the send flow with a draftTransaction in
      // progress.
      dispatch(initializeSendState({ chainHasChanged: true }));
    }
  };
}

const backgroundSetLocked = () => {
  return new Promise((resolve, reject) => {
    callBackgroundMethod('setLocked', [], (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

export function lockMetamask() {
  log.debug(`background.setLocked`);

  return (dispatch) => {
    dispatch(showLoadingIndication());

    return backgroundSetLocked()
      .then(() => updateMetamaskStateFromBackground())
      .catch((error) => {
        dispatch(displayWarning(error.message));
        return Promise.reject(error);
      })
      .then((newState) => {
        dispatch(updateMetamaskState(newState));
        dispatch(hideLoadingIndication());
        dispatch({ type: actionConstants.LOCK_METAMASK });
      })
      .catch(() => {
        dispatch(hideLoadingIndication());
        dispatch({ type: actionConstants.LOCK_METAMASK });
      });
  };
}

async function _setSelectedAddress(address) {
  log.debug(`background.setSelectedAddress`);
  await submitRequestToBackground('setSelectedAddress', [address]);
}

export function setSelectedAddress(address) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setSelectedAddress`);
    try {
      await _setSelectedAddress(address);
    } catch (error) {
      dispatch(displayWarning(error.message));
      return;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function setSelectedAccount(address) {
  return async (dispatch, getState) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setSelectedAddress`);

    const state = getState();
    const unconnectedAccountAccountAlertIsEnabled =
      getUnconnectedAccountAlertEnabledness(state);
    const activeTabOrigin = state.activeTab?.origin || 'metamask';
    const selectedAddress = getSelectedAddress(state);
    const permittedAccountsForCurrentTab =
      getPermittedAccountsForCurrentTab(state);
    const currentTabIsConnectedToPreviousAddress =
      Boolean(activeTabOrigin) &&
      permittedAccountsForCurrentTab.includes(selectedAddress);
    const currentTabIsConnectedToNextAddress =
      Boolean(activeTabOrigin) &&
      permittedAccountsForCurrentTab.includes(address);
    const switchingToUnconnectedAddress =
      currentTabIsConnectedToPreviousAddress &&
      !currentTabIsConnectedToNextAddress;

    try {
      await _setSelectedAddress(address);
      await forceUpdateMetamaskState(dispatch);
    } catch (error) {
      dispatch(displayWarning(error));
      return;
    } finally {
      dispatch(hideLoadingIndication());
    }

    if (
      unconnectedAccountAccountAlertIsEnabled &&
      switchingToUnconnectedAddress
    ) {
      dispatch(switchedToUnconnectedAccount());
      await setUnconnectedAccountAlertShown(activeTabOrigin);
    }
  };
}

export function addPermittedAccount(origin, address) {
  return async (dispatch) => {
    await new Promise((resolve, reject) => {
      callBackgroundMethod(
        'addPermittedAccount',
        [origin, address],
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        },
      );
    });
    await forceUpdateMetamaskState(dispatch);
  };
}

export function removePermittedAccount(origin, address) {
  return async (dispatch) => {
    await new Promise((resolve, reject) => {
      callBackgroundMethod(
        'removePermittedAccount',
        [origin, address],
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        },
      );
    });
    await forceUpdateMetamaskState(dispatch);
  };
}

export function showAccountsPage() {
  return {
    type: actionConstants.SHOW_ACCOUNTS_PAGE,
  };
}

export function showConfTxPage({ id } = {}) {
  return {
    type: actionConstants.SHOW_CONF_TX_PAGE,
    id,
  };
}

export function addToken({ token, dontShowLoadingIndicator = false }) {
  return async (dispatch) => {
    if (!dontShowLoadingIndicator) {
      dispatch(showLoadingIndication());
    }
    try {
      await submitRequestToBackground('addToken', [token]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
    } finally {
      await forceUpdateMetamaskState(dispatch);
      dispatch(hideLoadingIndication());
    }
  };
}

export function initTokens({ tokens, dontShowLoadingIndicator }) {
  return async (dispatch) => {
    if (!dontShowLoadingIndicator) {
      dispatch(showLoadingIndication());
    }
    try {
      await submitRequestToBackground('initTokens', [tokens]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
    } finally {
      await forceUpdateMetamaskState(dispatch);
      dispatch(hideLoadingIndication());
    }
  };
}
/**
 * To add detected tokens to state
 *
 * @param newDetectedTokens
 */
export function addDetectedTokens(newDetectedTokens) {
  return async (dispatch) => {
    try {
      await submitRequestToBackground('addDetectedTokens', [newDetectedTokens]);
    } catch (error) {
      log.error(error);
    } finally {
      await forceUpdateMetamaskState(dispatch);
    }
  };
}

/**
 * To add ignored token addresses to state
 *
 * @param options
 * @param options.tokensToIgnore
 * @param options.dontShowLoadingIndicator
 */
export function ignoreTokens({
  tokensToIgnore,
  dontShowLoadingIndicator = false,
}) {
  const _tokensToIgnore = Array.isArray(tokensToIgnore)
    ? tokensToIgnore
    : [tokensToIgnore];

  return async (dispatch) => {
    if (!dontShowLoadingIndicator) {
      dispatch(showLoadingIndication());
    }
    try {
      await submitRequestToBackground('ignoreTokens', [_tokensToIgnore]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
    } finally {
      await forceUpdateMetamaskState(dispatch);
      dispatch(hideLoadingIndication());
    }
  };
}

/**
 * To fetch the ERC20 tokens with non-zero balance in a single call
 *
 * @param tokens
 */
export async function getBalancesInSingleCall(tokens) {
  return await submitRequestToBackground('getBalancesInSingleCall', [tokens]);
}

export function addNft(address, tokenID, dontShowLoadingIndicator) {
  return async (dispatch) => {
    if (!address) {
      throw new Error('MetaMask - Cannot add collectible without address');
    }
    if (!tokenID) {
      throw new Error('MetaMask - Cannot add collectible without tokenID');
    }
    if (!dontShowLoadingIndicator) {
      dispatch(showLoadingIndication());
    }
    try {
      await submitRequestToBackground('addNft', [address, tokenID]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
    } finally {
      await forceUpdateMetamaskState(dispatch);
      dispatch(hideLoadingIndication());
    }
  };
}

export function addNftVerifyOwnership(
  address,
  tokenID,
  dontShowLoadingIndicator,
) {
  return async (dispatch) => {
    if (!address) {
      throw new Error('MetaMask - Cannot add collectible without address');
    }
    if (!tokenID) {
      throw new Error('MetaMask - Cannot add collectible without tokenID');
    }
    if (!dontShowLoadingIndicator) {
      dispatch(showLoadingIndication());
    }
    try {
      await submitRequestToBackground('addNftVerifyOwnership', [
        address,
        tokenID,
      ]);
    } catch (error) {
      if (
        error.message.includes('This NFT is not owned by the user') ||
        error.message.includes('Unable to verify ownership')
      ) {
        throw error;
      } else {
        log.error(error);
        dispatch(displayWarning(error.message));
      }
    } finally {
      await forceUpdateMetamaskState(dispatch);
      dispatch(hideLoadingIndication());
    }
  };
}

export function removeAndIgnoreNft(address, tokenID, dontShowLoadingIndicator) {
  return async (dispatch) => {
    if (!address) {
      throw new Error('MetaMask - Cannot ignore collectible without address');
    }
    if (!tokenID) {
      throw new Error('MetaMask - Cannot ignore collectible without tokenID');
    }
    if (!dontShowLoadingIndicator) {
      dispatch(showLoadingIndication());
    }
    try {
      await submitRequestToBackground('removeAndIgnoreNft', [address, tokenID]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
    } finally {
      await forceUpdateMetamaskState(dispatch);
      dispatch(hideLoadingIndication());
    }
  };
}

export function removeNft(address, tokenID, dontShowLoadingIndicator) {
  return async (dispatch) => {
    if (!address) {
      throw new Error('MetaMask - Cannot remove collectible without address');
    }
    if (!tokenID) {
      throw new Error('MetaMask - Cannot remove collectible without tokenID');
    }
    if (!dontShowLoadingIndicator) {
      dispatch(showLoadingIndication());
    }
    try {
      await submitRequestToBackground('removeNft', [address, tokenID]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
    } finally {
      await forceUpdateMetamaskState(dispatch);
      dispatch(hideLoadingIndication());
    }
  };
}

export async function checkAndUpdateAllNftsOwnershipStatus() {
  await submitRequestToBackground('checkAndUpdateAllNftsOwnershipStatus');
}

export async function isNftOwner(
  ownerAddress,
  collectibleAddress,
  collectibleId,
) {
  return await submitRequestToBackground('isNftOwner', [
    ownerAddress,
    collectibleAddress,
    collectibleId,
  ]);
}

export async function checkAndUpdateSingleNftOwnershipStatus(collectible) {
  await submitRequestToBackground('checkAndUpdateSingleNftOwnershipStatus', [
    collectible,
    false,
  ]);
}

export async function getTokenStandardAndDetails(
  address,
  userAddress,
  tokenId,
) {
  return await submitRequestToBackground('getTokenStandardAndDetails', [
    address,
    userAddress,
    tokenId,
  ]);
}

// TODO: Refactor this
export function addTokens(tokens) {
  return (dispatch) => {
    if (Array.isArray(tokens)) {
      return Promise.all(tokens.map((token) => dispatch(addToken({ token }))));
    }
    return Promise.all(
      Object.entries(tokens).map(([_, token]) => dispatch(addToken({ token }))),
    );
  };
}

export function rejectWatchAsset(suggestedAssetID) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      await submitRequestToBackground('rejectWatchAsset', [suggestedAssetID]);
      await forceUpdateMetamaskState(dispatch);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      return;
    } finally {
      dispatch(hideLoadingIndication());
    }
    dispatch(closeCurrentNotificationWindow());
  };
}

export function acceptWatchAsset(suggestedAssetID) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      await submitRequestToBackground('acceptWatchAsset', [suggestedAssetID]);
      await forceUpdateMetamaskState(dispatch);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning(error.message));
      return;
    } finally {
      dispatch(hideLoadingIndication());
    }
    dispatch(closeCurrentNotificationWindow());
  };
}

export function clearPendingTokens() {
  return async (dispatch) => {
    await submitRequestToBackground('clearPendingTokens');
    await forceUpdateMetamaskState(dispatch);
  };
  // return {
  //   type: actionConstants.CLEAR_PENDING_TOKENS,
  // };
}

export function createCancelTransaction(txId, customGasSettings, options = {}) {
  log.debug('background.cancelTransaction');
  let newTxId;

  return (dispatch) => {
    const actionId = generateActionId();
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'createCancelTransaction',
        [txId, customGasSettings, { ...options, actionId }],
        (err, newState) => {
          if (err) {
            dispatch(displayWarning(err.message));
            reject(err);
            return;
          }

          const { currentNetworkTxList } = newState;
          const { id } = currentNetworkTxList[currentNetworkTxList.length - 1];
          newTxId = id;
          resolve(newState);
        },
        actionId,
      );
    })
      .then((newState) => dispatch(updateMetamaskState(newState)))
      .then(() => newTxId);
  };
}

export function createSpeedUpTransaction(
  txId,
  customGasSettings,
  options = {},
) {
  log.debug('background.createSpeedUpTransaction');
  let newTx;

  return (dispatch) => {
    const actionId = generateActionId();
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'createSpeedUpTransaction',
        [txId, customGasSettings, { ...options, actionId }],
        (err, newState) => {
          if (err) {
            dispatch(displayWarning(err.message));
            reject(err);
            return;
          }

          const { currentNetworkTxList } = newState;
          newTx = currentNetworkTxList[currentNetworkTxList.length - 1];
          resolve(newState);
        },
        actionId,
      );
    })
      .then((newState) => dispatch(updateMetamaskState(newState)))
      .then(() => newTx);
  };
}

export function createRetryTransaction(txId, customGasSettings) {
  let newTx;

  return (dispatch) => {
    return new Promise((resolve, reject) => {
      const actionId = generateActionId();
      callBackgroundMethod(
        'createSpeedUpTransaction',
        [txId, customGasSettings, { actionId }],
        (err, newState) => {
          if (err) {
            dispatch(displayWarning(err.message));
            reject(err);
            return;
          }

          const { currentNetworkTxList } = newState;
          newTx = currentNetworkTxList[currentNetworkTxList.length - 1];
          resolve(newState);
        },
      );
    })
      .then((newState) => dispatch(updateMetamaskState(newState)))
      .then(() => newTx);
  };
}

export function setRpcTarget(newRpc, chainId, ticker = 'ETH', nickname) {
  return async (dispatch) => {
    log.debug(
      `background.setRpcTarget: ${newRpc} ${chainId} ${ticker} ${nickname}`,
    );

    try {
      await submitRequestToBackground('setCustomRpc', [
        newRpc,
        chainId,
        ticker,
        nickname || newRpc,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning('Had a problem changing networks!'));
    }
  };
}

export function rollbackToPreviousProvider() {
  return async (dispatch) => {
    try {
      await submitRequestToBackground('rollbackToPreviousProvider');
    } catch (error) {
      log.error(error);
      dispatch(displayWarning('Had a problem changing networks!'));
    }
  };
}

export function delRpcTarget(oldRpc) {
  return (dispatch) => {
    log.debug(`background.delRpcTarget: ${oldRpc}`);
    return new Promise((resolve, reject) => {
      callBackgroundMethod('delCustomRpc', [oldRpc], (err) => {
        if (err) {
          log.error(err);
          dispatch(displayWarning('Had a problem removing network!'));
          reject(err);
          return;
        }
        resolve();
      });
    });
  };
}

// Calls the addressBookController to add a new address.
export function addToAddressBook(
  recipient,
  nickname = '',
  memo = '',
  chainId = '',
) {
  log.debug(`background.addToAddressBook`);

  return async (dispatch, getState) => {
    let set;
    try {
      set = await submitRequestToBackground('setAddressBook', [
        recipient,
        nickname,
        chainId || getState().metamask.provider.chainId,
        memo,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning('Address book failed to update'));
      throw error;
    }
    if (!set) {
      dispatch(displayWarning('Address book failed to update'));
    }
  };
}

/**
 * @description Calls the addressBookController to remove an existing address.
 * @param chainId
 * @param {string} addressToRemove - Address of the entry to remove from the address book
 */
export function removeFromAddressBook(chainId, addressToRemove) {
  log.debug(`background.removeFromAddressBook`);

  return async () => {
    await submitRequestToBackground('removeFromAddressBook', [
      chainId,
      toChecksumHexAddress(addressToRemove),
    ]);
  };
}

export function showSettingsDropdown() {
  return {
    type: actionConstants.SETTINGS_DROPDOWN_OPEN,
  };
}

export function hideSettingsDropdown() {
  return {
    type: actionConstants.SETTINGS_DROPDOWN_CLOSE,
  };
}

export function showModal(payload) {
  return {
    type: actionConstants.MODAL_OPEN,
    payload,
  };
}

export function hideModal() {
  return {
    type: actionConstants.MODAL_CLOSE,
  };
}

export function closeCurrentNotificationWindow() {
  return (_, getState) => {
    if (
      getEnvironmentType() === ENVIRONMENT_TYPE_NOTIFICATION &&
      !hasUnconfirmedTransactions(getState())
    ) {
      closeNotificationPopup();
    }
  };
}

export function showAlert(msg) {
  return {
    type: actionConstants.ALERT_OPEN,
    value: msg,
  };
}

export function hideAlert() {
  return {
    type: actionConstants.ALERT_CLOSE,
  };
}

export function updateCollectibleDropDownState(value) {
  return async (dispatch) => {
    await submitRequestToBackground('updateCollectibleDropDownState', [value]);
    await forceUpdateMetamaskState(dispatch);
  };
}

/**
 * This action will receive two types of values via qrCodeData
 * an object with the following structure {type, values}
 * or null (used to clear the previous value)
 *
 * @param qrCodeData
 */
export function qrCodeDetected(qrCodeData) {
  return async (dispatch) => {
    await dispatch({
      type: actionConstants.QR_CODE_DETECTED,
      value: qrCodeData,
    });

    // If on the send page, the send slice will listen for the QR_CODE_DETECTED
    // action and update its state. Address changes need to recompute gasLimit
    // so we fire this method so that the send page gasLimit can be recomputed
    dispatch(computeEstimatedGasLimit());
  };
}

export function showLoadingIndication(message) {
  return {
    type: actionConstants.SHOW_LOADING,
    value: message,
  };
}

export function setHardwareWalletDefaultHdPath({ device, path }) {
  return {
    type: actionConstants.SET_HARDWARE_WALLET_DEFAULT_HD_PATH,
    value: { device, path },
  };
}

export function hideLoadingIndication() {
  return {
    type: actionConstants.HIDE_LOADING,
  };
}

export function initMultichainAccounts() {
  log.debug(`background.initAccounts`);
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      submitRequestToBackground('initAccounts');
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw error;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

/**
 * An action creator for display a warning to the user in various places in the
 * UI. It will not be cleared until a new warning replaces it or `hideWarning`
 * is called.
 *
 * @deprecated This way of displaying a warning is confusing for users and
 * should no longer be used.
 * @param {string} text - The warning text to show.
 * @returns The action to display the warning.
 */
export function displayWarning(text) {
  return {
    type: actionConstants.DISPLAY_WARNING,
    value: text,
  };
}

export function hideWarning() {
  return {
    type: actionConstants.HIDE_WARNING,
  };
}

export function exportAccount(password, address) {
  return function (dispatch) {
    dispatch(showLoadingIndication());

    log.debug(`background.verifyPassword`);
    return new Promise((resolve, reject) => {
      callBackgroundMethod('verifyPassword', [password], function (err) {
        if (err) {
          log.error('Error in verifying password.');
          dispatch(hideLoadingIndication());
          dispatch(displayWarning('Incorrect Password.'));
          reject(err);
          return;
        }
        log.debug(`background.exportAccount`);
        callBackgroundMethod(
          'exportAccount',
          [address, password],
          function (err2, result) {
            dispatch(hideLoadingIndication());

            if (err2) {
              log.error(err2);
              dispatch(displayWarning('Had a problem exporting the account.'));
              reject(err2);
              return;
            }

            dispatch(showPrivateKey(result));
            resolve(result);
          },
        );
      });
    });
  };
}

export function exportAccounts(password, addresses) {
  return function (dispatch) {
    log.debug(`background.verifyPassword`);
    return new Promise((resolve, reject) => {
      callBackgroundMethod('verifyPassword', [password], function (err) {
        if (err) {
          log.error('Error in submitting password.');
          reject(err);
          return;
        }
        log.debug(`background.exportAccounts`);
        const accountPromises = addresses.map(
          (address) =>
            new Promise((resolve2, reject2) =>
              callBackgroundMethod(
                'exportAccount',
                [address, password],
                function (err2, result) {
                  if (err2) {
                    log.error(err2);
                    dispatch(
                      displayWarning('Had a problem exporting the account.'),
                    );
                    reject2(err2);
                    return;
                  }
                  resolve2(result);
                },
              ),
            ),
        );
        resolve(Promise.all(accountPromises));
      });
    });
  };
}

export function showPrivateKey(key) {
  return {
    type: actionConstants.SHOW_PRIVATE_KEY,
    value: key,
  };
}

export function setAccountLabel(account, label) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setAccountLabel`);

    return new Promise((resolve, reject) => {
      callBackgroundMethod('setAccountLabel', [account, label], (err) => {
        dispatch(hideLoadingIndication());

        if (err) {
          dispatch(displayWarning(err.message));
          reject(err);
          return;
        }

        dispatch({
          type: actionConstants.SET_ACCOUNT_LABEL,
          value: { account, label },
        });
        resolve(account);
      });
    });
  };
}

export function clearAccountDetails() {
  return {
    type: actionConstants.CLEAR_ACCOUNT_DETAILS,
  };
}

export function showSendTokenPage() {
  return {
    type: actionConstants.SHOW_SEND_TOKEN_PAGE,
  };
}

export function setFeatureFlag(feature, activated, notificationType) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'setFeatureFlag',
        [feature, activated],
        (err, updatedFeatureFlags) => {
          dispatch(hideLoadingIndication());
          if (err) {
            dispatch(displayWarning(err.message));
            reject(err);
            return;
          }
          notificationType && dispatch(showModal({ name: notificationType }));
          resolve(updatedFeatureFlags);
        },
      );
    });
  };
}

export function setProviderType(type) {
  return async (dispatch) => {
    log.debug(`background.setProviderType`, type);

    try {
      await submitRequestToBackground('setProviderType', [type]);
    } catch (error) {
      dispatch(displayWarning('Had a problem changing networks!'));
    }
  };
}

export function setPreference(preference, value) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'setPreference',
        [preference, value],
        (err, updatedPreferences) => {
          dispatch(hideLoadingIndication());

          if (err) {
            dispatch(displayWarning(err.message));
            reject(err);
            return;
          }

          resolve(updatedPreferences);
        },
      );
    });
  };
}

export function setDefaultHomeActiveTabName(value) {
  return async (dispatch) => {
    await submitRequestToBackground('setDefaultHomeActiveTabName', [value]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setDefaultSwapsActiveTabName(value) {
  return async (dispatch) => {
    await submitRequestToBackground('setDefaultSwapsActiveTabName', [value]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setUseNativeCurrencyAsPrimaryCurrencyPreference(value) {
  return setPreference('useNativeCurrencyAsPrimaryCurrency', value);
}

export function setHideZeroBalanceTokens(value) {
  return setPreference('hideZeroBalanceTokens', value);
}

export function setShowFiatConversionOnTestnetsPreference(value) {
  return setPreference('showFiatInTestnets', value);
}

export function setShowTestNetworks(value) {
  return setPreference('showTestNetworks', value);
}

export function setAutoLockTimeLimit(value) {
  return setPreference('autoLockTimeLimit', value);
}

export function setCompletedOnboarding() {
  return async (dispatch) => {
    dispatch(showLoadingIndication());

    try {
      await submitRequestToBackground('completeOnboarding');
      dispatch(completeOnboarding());
    } catch (err) {
      dispatch(displayWarning(err.message));
      throw err;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function completeOnboarding() {
  return {
    type: actionConstants.COMPLETE_ONBOARDING,
  };
}

export function setMouseUserState(isMouseUser) {
  return {
    type: actionConstants.SET_MOUSE_USER_STATE,
    value: isMouseUser,
  };
}

export async function forceUpdateMetamaskState(dispatch) {
  log.debug(`background.getState`);

  let newState;
  try {
    newState = await submitRequestToBackground('getState');
  } catch (error) {
    dispatch(displayWarning(error.message));
    throw error;
  }

  dispatch(updateMetamaskState(newState));
  return newState;
}

export function toggleAccountMenu() {
  return {
    type: actionConstants.TOGGLE_ACCOUNT_MENU,
  };
}

export function setParticipateInMetaMetrics(val) {
  return (dispatch) => {
    log.debug(`background.setParticipateInMetaMetrics`);
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'setParticipateInMetaMetrics',
        [val],
        (err, metaMetricsId) => {
          log.debug(err);
          if (err) {
            dispatch(displayWarning(err.message));
            reject(err);
            return;
          }

          dispatch({
            type: actionConstants.SET_PARTICIPATE_IN_METAMETRICS,
            value: val,
          });
          resolve([val, metaMetricsId]);
        },
      );
    });
  };
}

export function setUseBlockie(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setUseBlockie`);
    callBackgroundMethod('setUseBlockie', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setUseNonceField(val) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setUseNonceField`);
    try {
      await submitRequestToBackground('setUseNonceField', [val]);
    } catch (error) {
      dispatch(displayWarning(error.message));
    }
    dispatch(hideLoadingIndication());
  };
}

export function setUsePhishDetect(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setUsePhishDetect`);
    callBackgroundMethod('setUsePhishDetect', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setUseMultiAccountBalanceChecker(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setUseMultiAccountBalanceChecker`);
    callBackgroundMethod('setUseMultiAccountBalanceChecker', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setUseTokenDetection(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setUseTokenDetection`);
    callBackgroundMethod('setUseTokenDetection', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setUseNftDetection(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setUseNftDetection`);
    callBackgroundMethod('setUseNftDetection', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setUseCurrencyRateCheck(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setUseCurrencyRateCheck`);
    callBackgroundMethod('setUseCurrencyRateCheck', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setOpenSeaEnabled(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setOpenSeaEnabled`);
    callBackgroundMethod('setOpenSeaEnabled', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function detectNfts() {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.detectNfts`);
    await submitRequestToBackground('detectNfts');
    dispatch(hideLoadingIndication());
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setAdvancedGasFee(val) {
  return (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setAdvancedGasFee`);
    callBackgroundMethod('setAdvancedGasFee', [val], (err) => {
      dispatch(hideLoadingIndication());
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setTheme(val) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    log.debug(`background.setTheme`);
    try {
      await submitRequestToBackground('setTheme', [val]);
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function setIpfsGateway(val) {
  return (dispatch) => {
    log.debug(`background.setIpfsGateway`);
    callBackgroundMethod('setIpfsGateway', [val], (err) => {
      if (err) {
        dispatch(displayWarning(err));
      }
    });
  };
}

export function updateCurrentLocale(key) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      await loadRelativeTimeFormatLocaleData(key);
      const localeMessages = await fetchLocale(key);
      await submitRequestToBackground('setCurrentLocale', [key]);
      // await switchDirection(textDirection);
      dispatch(setCurrentLocale(key, localeMessages));
    } catch (error) {
      dispatch(displayWarning(error.message));
      return;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function setCurrentLocale(locale, messages) {
  return {
    type: actionConstants.SET_CURRENT_LOCALE,
    payload: {
      locale,
      messages,
    },
  };
}

export function setPendingTokens(pendingTokens) {
  const { customToken = {}, selectedTokens = {} } = pendingTokens;
  const { localId, symbol, decimals } = customToken;

  const tokens =
    localId && symbol && decimals >= 0 <= 36
      ? {
          ...selectedTokens,
          [localId]: {
            ...customToken,
            isCustom: true,
          },
        }
      : selectedTokens;

  // return {
  //   type: actionConstants.SET_PENDING_TOKENS,
  //   payload: tokens,
  // };
  return async (dispatch) => {
    await submitRequestToBackground('setPendingTokens', [tokens]);
    await forceUpdateMetamaskState(dispatch);
  };
}

// Swaps

export function setSwapsLiveness(swapsLiveness) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsLiveness', [swapsLiveness]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setSwapsFeatureFlags(featureFlags) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsFeatureFlags', [featureFlags]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function fetchAndSetQuotes(fetchParams, fetchParamsMetaData) {
  return async (dispatch) => {
    const [quotes, selectedAggId] = await submitRequestToBackground(
      'fetchAndSetQuotes',
      [fetchParams, fetchParamsMetaData],
    );
    await forceUpdateMetamaskState(dispatch);
    return [quotes, selectedAggId];
  };
}

export function setSelectedQuoteAggId(aggId) {
  return async (dispatch) => {
    await submitRequestToBackground('setSelectedQuoteAggId', [aggId]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setSwapsTokens(tokens) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsTokens', [tokens]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function clearSwapsQuotes() {
  return async (dispatch) => {
    await submitRequestToBackground('clearSwapsQuotes');
    await forceUpdateMetamaskState(dispatch);
  };
}

export function resetBackgroundSwapsState() {
  return async (dispatch) => {
    const id = await submitRequestToBackground('resetSwapsState');
    await forceUpdateMetamaskState(dispatch);
    return id;
  };
}

export function setCustomApproveTxData(data) {
  return async (dispatch) => {
    await submitRequestToBackground('setCustomApproveTxData', [data]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setSwapsTxGasPrice(gasPrice) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsTxGasPrice', [gasPrice]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setSwapsTxGasLimit(gasLimit) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsTxGasLimit', [gasLimit, true]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function updateCustomSwapsEIP1559GasParams({
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
}) {
  return async (dispatch) => {
    await Promise.all([
      submitRequestToBackground('setSwapsTxGasLimit', [gasLimit]),
      submitRequestToBackground('setSwapsTxMaxFeePerGas', [maxFeePerGas]),
      submitRequestToBackground('setSwapsTxMaxFeePriorityPerGas', [
        maxPriorityFeePerGas,
      ]),
    ]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function updateSwapsUserFeeLevel(swapsCustomUserFeeLevel) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsUserFeeLevel', [
      swapsCustomUserFeeLevel,
    ]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setSwapsQuotesPollingLimitEnabled(quotesPollingLimitEnabled) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsQuotesPollingLimitEnabled', [
      quotesPollingLimitEnabled,
    ]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function customSwapsGasParamsUpdated(gasLimit, gasPrice) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsTxGasPrice', [gasPrice]);
    await submitRequestToBackground('setSwapsTxGasLimit', [gasLimit, true]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setTradeTxId(tradeTxId) {
  return async (dispatch) => {
    await submitRequestToBackground('setTradeTxId', [tradeTxId]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setApproveTxId(approveTxId) {
  return async (dispatch) => {
    await submitRequestToBackground('setApproveTxId', [approveTxId]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function safeRefetchQuotes() {
  return async (dispatch) => {
    await submitRequestToBackground('safeRefetchQuotes');
    await forceUpdateMetamaskState(dispatch);
  };
}

export function stopPollingForQuotes() {
  return async (dispatch) => {
    await submitRequestToBackground('stopPollingForQuotes');
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setBackgroundSwapRouteState(routeState) {
  return async (dispatch) => {
    await submitRequestToBackground('setBackgroundSwapRouteState', [
      routeState,
    ]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function resetSwapsPostFetchState() {
  return async (dispatch) => {
    await submitRequestToBackground('resetPostFetchState');
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setSwapsErrorKey(errorKey) {
  return async (dispatch) => {
    await submitRequestToBackground('setSwapsErrorKey', [errorKey]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function setInitialGasEstimate(initialAggId) {
  return async (dispatch) => {
    await submitRequestToBackground('setInitialGasEstimate', [initialAggId]);
    await forceUpdateMetamaskState(dispatch);
  };
}

// Permissions

export function requestAccountsPermissionWithId(origin) {
  return async (dispatch) => {
    const id = await submitRequestToBackground(
      'requestAccountsPermissionWithId',
      [origin],
    );
    await forceUpdateMetamaskState(dispatch);
    return id;
  };
}

/**
 * Approves the permissions request.
 *
 * @param {object} request - The permissions request to approve.
 */
export function approvePermissionsRequest(request) {
  return (dispatch) => {
    callBackgroundMethod('approvePermissionsRequest', [request], (err) => {
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

/**
 * Rejects the permissions request with the given ID.
 *
 * @param {string} requestId - The id of the request to be rejected
 */
export function rejectPermissionsRequest(requestId) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callBackgroundMethod('rejectPermissionsRequest', [requestId], (err) => {
        if (err) {
          dispatch(displayWarning(err.message));
          reject(err);
          return;
        }
        forceUpdateMetamaskState(dispatch).then(resolve).catch(reject);
      });
    });
  };
}

/**
 * Clears the given permissions for the given origin.
 *
 * @param subjects
 */
export function removePermissionsFor(subjects) {
  return (dispatch) => {
    callBackgroundMethod('removePermissionsFor', [subjects], (err) => {
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

// Pending Approvals

/**
 * Resolves a pending approval and closes the current notification window if no
 * further approvals are pending after the background state updates.
 *
 * @param {string} id - The pending approval id
 * @param {any} [value] - The value required to confirm a pending approval
 */
export function resolvePendingApproval(id, value) {
  return async (dispatch) => {
    await submitRequestToBackground('resolvePendingApproval', [id, value]);
    // Before closing the current window, check if any additional confirmations
    // are added as a result of this confirmation being accepted
    const { pendingApprovals } = await forceUpdateMetamaskState(dispatch);
    if (Object.values(pendingApprovals).length === 0) {
      dispatch(closeCurrentNotificationWindow());
    }
  };
}

/**
 * Rejects a pending approval and closes the current notification window if no
 * further approvals are pending after the background state updates.
 *
 * @param {string} id - The pending approval id
 * @param {Error} [error] - The error to throw when rejecting the approval
 */
export function rejectPendingApproval(id, error) {
  return async (dispatch) => {
    await submitRequestToBackground('rejectPendingApproval', [id, error]);
    // Before closing the current window, check if any additional confirmations
    // are added as a result of this confirmation being rejected
    const { pendingApprovals } = await forceUpdateMetamaskState(dispatch);
    if (Object.values(pendingApprovals).length === 0) {
      dispatch(closeCurrentNotificationWindow());
    }
  };
}

export function setFirstTimeFlowType(type) {
  return (dispatch) => {
    log.debug(`background.setFirstTimeFlowType`);
    callBackgroundMethod('setFirstTimeFlowType', [type], (err) => {
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
    dispatch({
      type: actionConstants.SET_FIRST_TIME_FLOW_TYPE,
      value: type,
    });
  };
}

export function setNewNftAddedMessage(newNftAddedMessage) {
  return {
    type: actionConstants.SET_NEW_NFT_ADDED_MESSAGE,
    payload: newNftAddedMessage,
  };
}

export function setRemoveNftMessage(removeNftMessage) {
  return {
    type: actionConstants.SET_REMOVE_NFT_MESSAGE,
    payload: removeNftMessage,
  };
}

export function setNewTokensImported(newTokensImported) {
  return {
    type: actionConstants.SET_NEW_TOKENS_IMPORTED,
    payload: newTokensImported,
  };
}

export function setLastActiveTime() {
  return (dispatch) => {
    callBackgroundMethod('setLastActiveTime', [], (err) => {
      if (err) {
        dispatch(displayWarning(err.message));
      }
    });
  };
}

export function setDismissSeedBackUpReminder(value) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    await submitRequestToBackground('setDismissSeedBackUpReminder', [value]);
    dispatch(hideLoadingIndication());
  };
}

export function setConnectedStatusPopoverHasBeenShown() {
  return () => {
    callBackgroundMethod('setConnectedStatusPopoverHasBeenShown', [], (err) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  };
}

export function setRecoveryPhraseReminderHasBeenShown() {
  return () => {
    callBackgroundMethod('setRecoveryPhraseReminderHasBeenShown', [], (err) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  };
}

export function setRecoveryPhraseReminderLastShown(lastShown) {
  return () => {
    callBackgroundMethod(
      'setRecoveryPhraseReminderLastShown',
      [lastShown],
      (err) => {
        if (err) {
          throw new Error(err.message);
        }
      },
    );
  };
}

export function loadingMethodDataStarted() {
  return {
    type: actionConstants.LOADING_METHOD_DATA_STARTED,
  };
}

export function loadingMethodDataFinished() {
  return {
    type: actionConstants.LOADING_METHOD_DATA_FINISHED,
  };
}

export function getContractMethodData(data = '') {
  return async (dispatch, getState) => {
    const prefixedData = addHexPrefix(data);
    const fourBytePrefix = prefixedData.slice(0, 10);
    if (fourBytePrefix.length < 10) {
      return {};
    }
    const { knownMethodData } = getState().metamask;
    if (
      knownMethodData &&
      knownMethodData[fourBytePrefix] &&
      Object.keys(knownMethodData[fourBytePrefix]).length !== 0
    ) {
      return knownMethodData[fourBytePrefix];
    }

    dispatch(loadingMethodDataStarted());
    log.debug(`loadingMethodData`);

    const { name, params } = await getMethodDataAsync(fourBytePrefix);

    dispatch(loadingMethodDataFinished());
    callBackgroundMethod(
      'addKnownMethodData',
      [fourBytePrefix, { name, params }],
      (err) => {
        if (err) {
          dispatch(displayWarning(err.message));
        }
      },
    );
    return { name, params };
  };
}

export function setSeedPhraseBackedUp(seedPhraseBackupState) {
  return (dispatch) => {
    log.debug(`background.setSeedPhraseBackedUp`);
    return new Promise((resolve, reject) => {
      callBackgroundMethod(
        'setSeedPhraseBackedUp',
        [seedPhraseBackupState],
        (err) => {
          if (err) {
            dispatch(displayWarning(err.message));
            reject(err);
            return;
          }
          forceUpdateMetamaskState(dispatch).then(resolve).catch(reject);
        },
      );
    });
  };
}

export function setNextNonce(nextNonce) {
  return {
    type: actionConstants.SET_NEXT_NONCE,
    value: nextNonce,
  };
}

export function getNextNonce() {
  return async (dispatch, getState) => {
    const address = getState().metamask.selectedAddress;
    let nextNonce;
    try {
      nextNonce = await submitRequestToBackground('getNextNonce', [address]);
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw error;
    }
    dispatch(setNextNonce(nextNonce));
    return nextNonce;
  };
}

export function setRequestAccountTabIds(requestAccountTabIds) {
  return {
    type: actionConstants.SET_REQUEST_ACCOUNT_TABS,
    value: requestAccountTabIds,
  };
}

export function getRequestAccountTabIds() {
  return async (dispatch) => {
    const requestAccountTabIds = await submitRequestToBackground(
      'getRequestAccountTabIds',
    );
    dispatch(setRequestAccountTabIds(requestAccountTabIds));
  };
}

export function setOpenMetamaskTabsIDs(openMetaMaskTabIDs) {
  return {
    type: actionConstants.SET_OPEN_METAMASK_TAB_IDS,
    value: openMetaMaskTabIDs,
  };
}

export function getOpenMetamaskTabsIds() {
  return async (dispatch) => {
    const openMetaMaskTabIDs = await submitRequestToBackground(
      'getOpenMetamaskTabsIds',
    );
    dispatch(setOpenMetamaskTabsIDs(openMetaMaskTabIDs));
  };
}

export function setLedgerTransportPreference(value) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    await submitRequestToBackground('setLedgerTransportPreference', [value]);
    dispatch(hideLoadingIndication());
  };
}

export function updateAndApproveP2PTransaction(txId) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      await submitRequestToBackground('updateAndApproveP2PTransaction', [txId]);
    } catch (error) {
      dispatch(displayWarning('Approve transaction request failed'));
      throw error;
    }
    dispatch(hideLoadingIndication());
  };
}

export function p2pExchangesFilter(params, loadMore) {
  return async (dispatch) => {
    await submitRequestToBackground('p2pExchangesFilter', [params, loadMore]);
    await forceUpdateMetamaskState(dispatch);
  };
}

export function p2pExchangesStart(type, params) {
  return () => {
    return submitRequestToBackground('p2pExchangesStart', [type, params]);
  };
}

export function p2pExchangesExchangerCreate(params) {
  return async () => {
    return submitRequestToBackground('p2pExchangesExchangerCreate', [params]);
  };
}

export function exchangerUpdate(params) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      const exchangerInstance = await submitRequestToBackground(
        'exchangerUpdate',
        [params],
      );
      return exchangerInstance;
    } catch (err) {
      return null;
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function exchangerRepeatExchange(exchangeData) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      await submitRequestToBackground('exchangerRepeatExchange', [
        exchangeData,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function exchangerRejectExchange(exchangeId) {
  return handleBackgroundSubmit('exchangerRejectExchange', {
    args: [exchangeId],
  });
}

export function exchangerReserve(reserve) {
  return handleBackgroundSubmit('exchangerReserve', { args: [reserve] });
}

export function exchangerSetActive(isActive) {
  return handleBackgroundSubmit('exchangerSetActive', { args: [isActive] });
}

export function exchangerSetActiveDirection(id, isActive) {
  return handleBackgroundSubmit('exchangerSetActiveDirection', {
    args: [id, isActive],
  });
}

export function exchangerUserConfirmation(id) {
  return handleBackgroundSubmit('exchangerUserConfirmation', { args: [id] });
}

export function exchangerSettingRemove(id) {
  return handleBackgroundSubmit('exchangerSettingRemove', {
    args: [id],
  });
}

export function p2pCommitReserves(reserves) {
  return handleBackgroundSubmit('p2pCommitReserves', {
    args: [reserves],
  });
}

export function p2pCommitReservesSettings(settings) {
  return handleBackgroundSubmit('p2pCommitReservesSettings', {
    args: [settings],
  });
}

export function p2pRemoveReserveSetting(settingsId) {
  return handleBackgroundSubmit('p2pRemoveReserveSetting', {
    args: [settingsId],
  });
}
// Payment methods actions
export function savePaymentMethod(val) {
  return handleBackgroundSubmit('savePaymentMethod', { args: [val] });
}

export function dextradeRequest({
  method = 'GET',
  url,
  data = null,
  params = null,
  showLoading = true,
}) {
  return async (dispatch) => {
    if (showLoading) {
      dispatch(showLoadingIndication());
    }
    try {
      const response = await submitRequestToBackground('dextradeRequest', [
        method,
        url,
        data,
        params,
      ]);
      return response;
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw new Error(error.message);
    } finally {
      dispatch(hideLoadingIndication());
    }
  };
}

export function removePaymentMethod(val) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    await submitRequestToBackground('removePaymentMethod', [val]);
    await forceUpdateMetamaskState(dispatch);
    dispatch(hideLoadingIndication());
  };
}

export async function attemptLedgerTransportCreation() {
  return await submitRequestToBackground('attemptLedgerTransportCreation');
}

export function captureSingleException(error) {
  return async (dispatch, getState) => {
    const { singleExceptions } = getState().appState;
    if (!(error in singleExceptions)) {
      dispatch({
        type: actionConstants.CAPTURE_SINGLE_EXCEPTION,
        value: error,
      });
      captureException(Error(error));
    }
  };
}

export function setOutdatedBrowserWarningLastShown(lastShown) {
  return async () => {
    await submitRequestToBackground('setOutdatedBrowserWarningLastShown', [
      lastShown,
    ]);
  };
}

// TODO: refactor exchanger swap methods
// SWAPS OTC
export function swapGetOtcRates(...args) {
  return async () => submitRequestToBackground('swapGetOtcRates', args);
}
export function swapOtcExchangesStart(...args) {
  return async () => submitRequestToBackground('swapOtcExchangesStart', args);
}
export function swapOtcExchangesGetById(...args) {
  return async () => submitRequestToBackground('swapOtcExchangesGetById', args);
}
// SWAPS DEX
export function swapGetDexRates(...args) {
  return async () => submitRequestToBackground('swapGetDexRates', args);
}
// swaps-exchanger approve get allowance
export function swapExchangerGetAllowance(...args) {
  return async () =>
    submitRequestToBackground('swapExchangerGetAllowance', args);
}
// swaps-exchanger approve create approve
export function swapExchangerApprove(...args) {
  return async () => submitRequestToBackground('swapExchangerApprove', args);
}
// swaps-exchanger swap
export function swapExchangerByProvider(...args) {
  return async () => submitRequestToBackground('swapExchangerByProvider', args);
}

/**
 * actions for multisigner
 */
// MULTISIGN CREATOR MOUNT
export function multisignMount() {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignMount', []);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN CREATOR UNMOUNT
export function multisignUnmount() {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignUnmount', []);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN CREATOR SET TOKEN
export function multisignSetToken(value) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignSetToken', [value]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN CREATOR SET TOKEN SCRIPT
export function multisignSetTokenScript(values) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignSetTokenScript', [
        values,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN GENERATE
export function multisignGenerate() {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      const id = await submitRequestToBackground('multisignGenerate', []);
      // TODO: Move into UI
      // await navigator.clipboard.writeText(id);
      return id;
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN ADD
export function multisignAdd(id) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignAdd', [id]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN REMOVE
export function multisignRemove(addressId, chain) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignRemove', [
        addressId,
        chain,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN TRANSACTION WEIGHT
export function multisignTransactionWeight(payload) {
  return async () => {
    try {
      return await submitRequestToBackground('multisignTransactionWeight', [
        payload,
      ]);
    } catch (err) {
      throw new Error(err);
    }
  };
}
// MULTISIGN TRANSACTION CREATE
export function multisignTransactionCreate(payload) {
  return async () => {
    try {
      return await submitRequestToBackground('multisignTransactionCreate', [
        payload,
      ]);
    } catch (err) {
      throw new Error(err);
    }
  };
}
// MULTISIGN TRANSACTION SIGN
export function multisignTransactionSign(payload = { txId: '', chain: '' }) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignTransactionSign', [
        payload,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}
// MULTISIGN TRANSACTION DECLINE
export function multisignTransactionDecline(payload = { txId: '', chain: '' }) {
  return async (dispatch) => {
    dispatch(showLoadingIndication());
    try {
      return await submitRequestToBackground('multisignTransactionDecline', [
        payload,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoadingIndication());
    }
    return null;
  };
}

// Wrappers around promisifedBackground
/**
 * The "actions" below are not actions nor action creators. They cannot use
 * dispatch nor should they be dispatched when used. Instead they can be
 * called directly. These wrappers will be moved into their location at some
 * point in the future.
 */

export function estimateGas(params) {
  return submitRequestToBackground('estimateGas', [params]);
}

export async function updateTokenType(tokenAddress) {
  let token = {};
  try {
    token = await submitRequestToBackground('updateTokenType', [tokenAddress]);
  } catch (error) {
    log.error(error);
  }
  return token;
}

/**
 * initiates polling for gas fee estimates.
 *
 * @param chainId
 * @returns {string} a unique identify of the polling request that can be used
 *  to remove that request from consideration of whether polling needs to
 *  continue.
 */
export function getGasFeeEstimatesAndStartPolling(chainId) {
  return submitRequestToBackground('getGasFeeEstimatesAndStartPolling', [
    undefined,
    chainId,
  ]);
}

/**
 * Informs the GasFeeController that a specific token is no longer requiring
 * gas fee estimates. If all tokens unsubscribe the controller stops polling.
 *
 * @param {string} pollToken - Poll token received from calling
 *  `getGasFeeEstimatesAndStartPolling`.
 */
export function disconnectGasFeeEstimatePoller(pollToken) {
  return submitRequestToBackground('disconnectGasFeeEstimatePoller', [
    pollToken,
  ]);
}

export async function addPollingTokenToAppState(pollingToken) {
  return submitRequestToBackground('addPollingTokenToAppState', [
    pollingToken,
    POLLING_TOKEN_ENVIRONMENT_TYPES[getEnvironmentType()],
  ]);
}

export async function removePollingTokenFromAppState(pollingToken) {
  return submitRequestToBackground('removePollingTokenFromAppState', [
    pollingToken,
    POLLING_TOKEN_ENVIRONMENT_TYPES[getEnvironmentType()],
  ]);
}

export function getGasFeeTimeEstimate(maxPriorityFeePerGas, maxFeePerGas) {
  return submitRequestToBackground('getGasFeeTimeEstimate', [
    maxPriorityFeePerGas,
    maxFeePerGas,
  ]);
}

export async function closeNotificationPopup() {
  await submitRequestToBackground('markNotificationPopupAsAutomaticallyClosed');
  global.platform.closeCurrentWindow();
}

// MetaMetrics
/**
 * @typedef {import('../../shared/constants/metametrics').MetaMetricsEventPayload} MetaMetricsEventPayload
 * @typedef {import('../../shared/constants/metametrics').MetaMetricsEventOptions} MetaMetricsEventOptions
 * @typedef {import('../../shared/constants/metametrics').MetaMetricsPagePayload} MetaMetricsPagePayload
 * @typedef {import('../../shared/constants/metametrics').MetaMetricsPageOptions} MetaMetricsPageOptions
 */

/**
 * @param {MetaMetricsEventPayload} payload - details of the event to track
 * @param {MetaMetricsEventOptions} options - options for routing/handling of event
 * @returns {Promise<void>}
 */
export function trackMetaMetricsEvent(payload, options) {
  return submitRequestToBackground('trackMetaMetricsEvent', [
    { ...payload, actionId: generateActionId() },
    options,
  ]);
}

export function createEventFragment(options) {
  const actionId = generateActionId();
  return submitRequestToBackground('createEventFragment', [
    { ...options, actionId },
  ]);
}

export function createTransactionEventFragment(transactionId, event) {
  const actionId = generateActionId();
  return submitRequestToBackground('createTransactionEventFragment', [
    transactionId,
    event,
    actionId,
  ]);
}

export function updateEventFragment(id, payload) {
  return submitRequestToBackground('updateEventFragment', [id, payload]);
}

export function finalizeEventFragment(id, options) {
  return submitRequestToBackground('finalizeEventFragment', [id, options]);
}

/**
 * @param {MetaMetricsPagePayload} payload - details of the page viewed
 * @param {MetaMetricsPageOptions} options - options for handling the page view
 */
export function trackMetaMetricsPage(payload, options) {
  return submitRequestToBackground('trackMetaMetricsPage', [
    { ...payload, actionId: generateActionId() },
    options,
  ]);
}

export function updateViewedNotifications(notificationIdViewedStatusMap) {
  return submitRequestToBackground('updateViewedNotifications', [
    notificationIdViewedStatusMap,
  ]);
}

export async function setAlertEnabledness(alertId, enabledness) {
  await submitRequestToBackground('setAlertEnabledness', [
    alertId,
    enabledness,
  ]);
}

export async function setUnconnectedAccountAlertShown(origin) {
  await submitRequestToBackground('setUnconnectedAccountAlertShown', [origin]);
}

export async function setWeb3ShimUsageAlertDismissed(origin) {
  await submitRequestToBackground('setWeb3ShimUsageAlertDismissed', [origin]);
}

// Smart Transactions Controller
export async function setSmartTransactionsOptInStatus(
  optInState,
  prevOptInState,
) {
  trackMetaMetricsEvent({
    actionId: generateActionId(),
    event: 'STX OptIn',
    category: EVENT.CATEGORIES.SWAPS,
    sensitiveProperties: {
      stx_enabled: true,
      current_stx_enabled: true,
      stx_user_opt_in: optInState,
      stx_prev_user_opt_in: prevOptInState,
    },
  });
  await submitRequestToBackground('setSmartTransactionsOptInStatus', [
    optInState,
  ]);
}

export function clearSmartTransactionFees() {
  submitRequestToBackground('clearSmartTransactionFees');
}

export function fetchSmartTransactionFees(
  unsignedTransaction,
  approveTxParams,
) {
  return async (dispatch) => {
    if (approveTxParams) {
      approveTxParams.value = '0x0';
    }
    try {
      const smartTransactionFees = await await submitRequestToBackground(
        'fetchSmartTransactionFees',
        [unsignedTransaction, approveTxParams],
      );
      dispatch({
        type: actionConstants.SET_SMART_TRANSACTIONS_ERROR,
        payload: null,
      });
      return smartTransactionFees;
    } catch (e) {
      log.error(e);
      if (e.message.startsWith('Fetch error:')) {
        const errorObj = parseSmartTransactionsError(e.message);
        dispatch({
          type: actionConstants.SET_SMART_TRANSACTIONS_ERROR,
          payload: errorObj,
        });
      }
      throw e;
    }
  };
}

const createSignedTransactions = async (
  unsignedTransaction,
  fees,
  areCancelTransactions,
) => {
  const unsignedTransactionsWithFees = fees.map((fee) => {
    const unsignedTransactionWithFees = {
      ...unsignedTransaction,
      maxFeePerGas: decimalToHex(fee.maxFeePerGas),
      maxPriorityFeePerGas: decimalToHex(fee.maxPriorityFeePerGas),
      gas: areCancelTransactions
        ? decimalToHex(21000) // It has to be 21000 for cancel transactions, otherwise the API would reject it.
        : unsignedTransaction.gas,
      value: unsignedTransaction.value,
    };
    if (areCancelTransactions) {
      unsignedTransactionWithFees.to = unsignedTransactionWithFees.from;
      unsignedTransactionWithFees.data = '0x';
    }
    return unsignedTransactionWithFees;
  });
  const signedTransactions = await submitRequestToBackground(
    'approveTransactionsWithSameNonce',
    [unsignedTransactionsWithFees],
  );
  return signedTransactions;
};

export function signAndSendSmartTransaction({
  unsignedTransaction,
  smartTransactionFees,
}) {
  return async (dispatch) => {
    const signedTransactions = await createSignedTransactions(
      unsignedTransaction,
      smartTransactionFees.fees,
    );
    const signedCanceledTransactions = await createSignedTransactions(
      unsignedTransaction,
      smartTransactionFees.cancelFees,
      true,
    );
    try {
      const response = await submitRequestToBackground(
        'submitSignedTransactions',
        [
          {
            signedTransactions,
            signedCanceledTransactions,
            txParams: unsignedTransaction,
          },
        ],
      ); // Returns e.g.: { uuid: 'dP23W7c2kt4FK9TmXOkz1UM2F20' }
      return response.uuid;
    } catch (e) {
      log.error(e);
      if (e.message.startsWith('Fetch error:')) {
        const errorObj = parseSmartTransactionsError(e.message);
        dispatch({
          type: actionConstants.SET_SMART_TRANSACTIONS_ERROR,
          payload: errorObj,
        });
      }
      throw e;
    }
  };
}

export function updateSmartTransaction(uuid, txData) {
  return async (dispatch) => {
    try {
      await submitRequestToBackground('updateSmartTransaction', [
        {
          uuid,
          ...txData,
        },
      ]);
    } catch (e) {
      log.error(e);
      if (e.message.startsWith('Fetch error:')) {
        const errorObj = parseSmartTransactionsError(e.message);
        dispatch({
          type: actionConstants.SET_SMART_TRANSACTIONS_ERROR,
          payload: errorObj,
        });
      }
      throw e;
    }
  };
}

export function setSmartTransactionsRefreshInterval(refreshInterval) {
  return async () => {
    try {
      await submitRequestToBackground('setStatusRefreshInterval', [
        refreshInterval,
      ]);
    } catch (e) {
      log.error(e);
    }
  };
}

export function cancelSmartTransaction(uuid) {
  return async (dispatch) => {
    try {
      await submitRequestToBackground('cancelSmartTransaction', [uuid]);
    } catch (e) {
      log.error(e);
      if (e.message.startsWith('Fetch error:')) {
        const errorObj = parseSmartTransactionsError(e.message);
        dispatch({
          type: actionConstants.SET_SMART_TRANSACTIONS_ERROR,
          payload: errorObj,
        });
      }
      throw e;
    }
  };
}

export function fetchSmartTransactionsLiveness() {
  return async () => {
    try {
      await submitRequestToBackground('fetchSmartTransactionsLiveness');
    } catch (e) {
      log.error(e);
    }
  };
}

export function dismissSmartTransactionsErrorMessage() {
  return {
    type: actionConstants.DISMISS_SMART_TRANSACTIONS_ERROR_MESSAGE,
  };
}

// DetectTokenController
export async function detectNewTokens() {
  return submitRequestToBackground('detectNewTokens');
}

// App state
export function hideTestNetMessage() {
  return submitRequestToBackground('setShowTestnetMessageInDropdown', [false]);
}

export function hidePortfolioTooltip() {
  return submitRequestToBackground('setShowPortfolioTooltip', [false]);
}

export function hideBetaHeader() {
  return submitRequestToBackground('setShowBetaHeader', [false]);
}

export function setTransactionSecurityCheckEnabled(
  transactionSecurityCheckEnabled,
) {
  return async () => {
    try {
      await submitRequestToBackground('setTransactionSecurityCheckEnabled', [
        transactionSecurityCheckEnabled,
      ]);
    } catch (error) {
      log.error(error);
    }
  };
}

export function setFirstTimeUsedNetwork(chainId) {
  return submitRequestToBackground('setFirstTimeUsedNetwork', [chainId]);
}

export function walletConnect(data) {
  return async () => {
    await submitRequestToBackground('walletConnect', [data]);
  };
}

export function dextradeRefreshApiKey() {
  return async (dispatch) => {
    try {
      await submitRequestToBackground('dextradeRefreshApiKey');
    } catch (error) {
      dispatch(displayWarning(error.message));
      throw new Error(error.message);
    }
  };
}

export async function dextradeSetShowRelogin(val) {
  await submitRequestToBackground('submitQRHardwareCryptoAccount', [val]);
}

// QR Hardware Wallets
export async function submitQRHardwareCryptoHDKey(cbor) {
  await submitRequestToBackground('submitQRHardwareCryptoHDKey', [cbor]);
}

export async function submitQRHardwareCryptoAccount(cbor) {
  await submitRequestToBackground('submitQRHardwareCryptoAccount', [cbor]);
}

export function cancelSyncQRHardware() {
  return async (dispatch) => {
    dispatch(hideLoadingIndication());
    await submitRequestToBackground('cancelSyncQRHardware');
  };
}

export async function submitQRHardwareSignature(requestId, cbor) {
  await submitRequestToBackground('submitQRHardwareSignature', [
    requestId,
    cbor,
  ]);
}

export function cancelQRHardwareSignRequest() {
  return async (dispatch) => {
    dispatch(hideLoadingIndication());
    await submitRequestToBackground('cancelQRHardwareSignRequest');
  };
}

export function requestAddNetworkApproval(customRpc, originIsMetaMask) {
  return async (dispatch) => {
    try {
      await submitRequestToBackground('requestAddNetworkApproval', [
        customRpc,
        originIsMetaMask,
      ]);
    } catch (error) {
      log.error(error);
      dispatch(displayWarning('Had a problem changing networks!'));
    }
  };
}

export function requestUserApproval({ origin, type, requestData }) {
  return async (dispatch) => {
    try {
      await submitRequestToBackground('requestUserApproval', [
        {
          origin,
          type,
          requestData,
        },
      ]);
    } catch (error) {
      logErrorWithMessage(error);
      dispatch(displayWarning('Had trouble requesting user approval'));
    }
  };
}
