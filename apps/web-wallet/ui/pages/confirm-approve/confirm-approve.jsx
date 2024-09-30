import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmTransactionBase from '../confirm-transaction-base';
import { EditGasModes } from '../../../shared/constants/gas';
import {
  showModal,
  updateCustomNonce,
  getNextNonce,
} from '../../store/actions';
import { getTokenApprovedParam } from '../../helpers/utils/token-util';
import { GasFeeContextProvider } from '../../contexts/gasFee';
import { TransactionModalContextProvider } from '../../contexts/transaction-modal';
import { isAddressLedger } from '../../ducks/metamask/metamask';
import ConfirmContractInteraction from '../confirm-contract-interaction';
import {
  getCurrentCurrency,
  getSubjectMetadata,
  getUseNonceField,
  getCustomNonceValue,
  getNextSuggestedNonce,
  getCurrentChainId,
  getRpcPrefsForCurrentProvider,
  getIsMultiLayerFeeNetwork,
  getUseCurrencyRateCheck,
} from '../../selectors';
import { useApproveTransaction } from '../../hooks/useApproveTransaction';
import { useSimulationFailureWarning } from '../../hooks/useSimulationFailureWarning';
import AdvancedGasFeePopover from '../../components/app/advanced-gas-fee-popover';
import EditGasFeePopover from '../../components/app/edit-gas-fee-popover';
import EditGasPopover from '../../components/app/edit-gas-popover/edit-gas-popover.component';
import Loading from '../../components/ui/loading-screen';
import { parseStandardTokenTransactionData } from '../../../shared/modules/transaction.utils';
import { TokenStandard } from '../../../shared/constants/transaction';
import { calcTokenAmount } from '../../../shared/lib/transactions-controller-utils';
import TokenAllowance from '../token-allowance/token-allowance';
import ConfirmP2p from '../confirm-p2p';
import { getCustomTxParamsData } from './confirm-approve.util';
import ConfirmApproveContent from './confirm-approve-content';

const isAddressLedgerByFromAddress = (address) => (state) => {
  return isAddressLedger(state, address);
};

export default function ConfirmApprove({
  hideNavigation = false,
  assetStandard,
  assetName,
  userBalance,
  tokenSymbol,
  decimals,
  tokenImage,
  tokenAmount,
  tokenId,
  userAddress,
  toAddress,
  tokenAddress,
  transaction,
  ethTransactionTotal,
  fiatTransactionTotal,
  hexTransactionTotal,
  isSetApproveForAll,
  nativeCurrency,
  nativeDecimals,
  callbackCancel,
  callbackCancelError,
  callbackSubmit,
  callbackSubmitError,
}) {
  const dispatch = useDispatch();
  const { txParams: { data: transactionData } = {} } = transaction;
  const currentCurrency = useSelector(getCurrentCurrency);
  const subjectMetadata = useSelector(getSubjectMetadata);
  const useNonceField = useSelector(getUseNonceField);
  const nextNonce = useSelector(getNextSuggestedNonce);
  const customNonceValue = useSelector(getCustomNonceValue);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  const isMultiLayerFeeNetwork = useSelector(getIsMultiLayerFeeNetwork);
  const fromAddressIsLedger = useSelector(
    isAddressLedgerByFromAddress(userAddress),
  );
  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);
  const [customPermissionAmount, setCustomPermissionAmount] = useState('');
  const [submitWarning, setSubmitWarning] = useState('');
  const [isContract, setIsContract] = useState(false);
  const [userAcknowledgedGasMissing, setUserAcknowledgedGasMissing] =
    useState(false);

  const supportsEIP1559 = true;

  const previousTokenAmount = useRef(tokenAmount);
  const {
    approveTransaction,
    showCustomizeGasPopover,
    closeCustomizeGasPopover,
  } = useApproveTransaction();
  const renderSimulationFailureWarning = useSimulationFailureWarning(
    userAcknowledgedGasMissing,
  );

  useEffect(() => {
    if (customPermissionAmount && previousTokenAmount.current !== tokenAmount) {
      setCustomPermissionAmount(tokenAmount);
    }
    previousTokenAmount.current = tokenAmount;
  }, [customPermissionAmount, tokenAmount]);

  const prevNonce = useRef(nextNonce);
  const prevCustomNonce = useRef(customNonceValue);
  useEffect(() => {
    if (
      prevNonce.current !== nextNonce ||
      prevCustomNonce.current !== customNonceValue
    ) {
      if (nextNonce !== null && customNonceValue > nextNonce) {
        setSubmitWarning(
          `Nonce is higher than suggested nonce of ${nextNonce}`,
        );
      } else {
        setSubmitWarning('');
      }
    }
    prevCustomNonce.current = customNonceValue;
    prevNonce.current = nextNonce;
  }, [customNonceValue, nextNonce]);

  const checkIfContract = useCallback(async () => {
    // TODO: Fix it
    // const { isContractAddress } = await readAddressAsContract(
    //   global.eth,
    //   toAddress,
    // );
    // setIsContract(isContractAddress);
    setIsContract(true);
  }, [setIsContract, toAddress]);

  useEffect(() => {
    checkIfContract();
  }, [checkIfContract]);

  const { origin } = transaction;
  const formattedOrigin = origin || '';

  const { iconUrl: siteImage = '' } = subjectMetadata[origin] || {};

  let tokensText;
  if (
    assetStandard === TokenStandard.ERC721 ||
    assetStandard === TokenStandard.ERC1155
  ) {
    tokensText = assetName;
  }

  const tokenBalance = userBalance
    ? calcTokenAmount(userBalance, decimals).toString(10)
    : '';
  const customData = customPermissionAmount
    ? getCustomTxParamsData(transactionData, {
        customPermissionAmount,
        decimals,
      })
    : null;

  const parsedTransactionData =
    parseStandardTokenTransactionData(transactionData);
  const isApprovalOrRejection = getTokenApprovedParam(parsedTransactionData);

  if (tokenSymbol === undefined && assetName === undefined) {
    return <Loading />;
  }
  if (assetStandard === undefined) {
    return <ConfirmContractInteraction />;
  }
  if (assetStandard === TokenStandard.ERC20) {
    return (
      <GasFeeContextProvider transaction={transaction}>
        <TransactionModalContextProvider>
          <TokenAllowance
            origin={formattedOrigin}
            siteImage={siteImage}
            showCustomizeGasModal={approveTransaction}
            useNonceField={useNonceField}
            currentCurrency={currentCurrency}
            nativeCurrency={nativeCurrency}
            nativeDecimals={nativeDecimals}
            ethTransactionTotal={ethTransactionTotal}
            fiatTransactionTotal={fiatTransactionTotal}
            hexTransactionTotal={hexTransactionTotal}
            txData={transaction}
            isMultiLayerFeeNetwork={isMultiLayerFeeNetwork}
            supportsEIP1559={supportsEIP1559}
            userAddress={userAddress}
            tokenAddress={tokenAddress}
            data={transactionData}
            isSetApproveForAll={isSetApproveForAll}
            isApprovalOrRejection={isApprovalOrRejection}
            dappProposedTokenAmount={tokenAmount}
            currentTokenBalance={tokenBalance}
            toAddress={toAddress}
            tokenSymbol={tokenSymbol}
            decimals={decimals}
          />
          {showCustomizeGasPopover && !supportsEIP1559 && (
            <EditGasPopover
              onClose={closeCustomizeGasPopover}
              mode={EditGasModes.modifyInPlace}
              transaction={transaction}
            />
          )}
          {supportsEIP1559 && (
            <>
              <EditGasFeePopover />
              <AdvancedGasFeePopover />
            </>
          )}
        </TransactionModalContextProvider>
      </GasFeeContextProvider>
    );
  }

  return (
    <GasFeeContextProvider transaction={transaction}>
      <ConfirmTransactionBase
        transaction={transaction}
        toAddress={toAddress}
        identiconAddress={toAddress}
        showAccountInHeader
        title={tokensText}
        tokenAddress={tokenAddress}
        customTokenAmount={String(customPermissionAmount)}
        dappProposedTokenAmount={tokenAmount}
        currentTokenBalance={tokenBalance}
        isApprovalOrRejection={isApprovalOrRejection}
        contentComponent={
          <TransactionModalContextProvider>
            <ConfirmApproveContent
              userAddress={userAddress}
              isSetApproveForAll={isSetApproveForAll}
              isApprovalOrRejection={isApprovalOrRejection}
              siteImage={siteImage}
              origin={formattedOrigin}
              tokenSymbol={tokenSymbol}
              tokenImage={tokenImage}
              tokenId={tokenId}
              assetName={assetName}
              assetStandard={assetStandard}
              tokenAddress={tokenAddress}
              showCustomizeGasModal={approveTransaction}
              data={customData || transactionData}
              toAddress={toAddress}
              currentCurrency={currentCurrency}
              nativeCurrency={nativeCurrency}
              nativeDecimals={nativeDecimals}
              ethTransactionTotal={ethTransactionTotal}
              fiatTransactionTotal={fiatTransactionTotal}
              hexTransactionTotal={hexTransactionTotal}
              useNonceField={useNonceField}
              nextNonce={nextNonce}
              customNonceValue={customNonceValue}
              userAcknowledgedGasMissing={userAcknowledgedGasMissing}
              setUserAcknowledgedGasMissing={setUserAcknowledgedGasMissing}
              renderSimulationFailureWarning={renderSimulationFailureWarning}
              updateCustomNonce={(value) => {
                dispatch(updateCustomNonce(value));
              }}
              getNextNonce={() => dispatch(getNextNonce())}
              showCustomizeNonceModal={({
                /* eslint-disable no-shadow */
                useNonceField,
                nextNonce,
                customNonceValue,
                updateCustomNonce,
                getNextNonce,
                /* eslint-disable no-shadow */
              }) =>
                dispatch(
                  showModal({
                    name: 'CUSTOMIZE_NONCE',
                    useNonceField,
                    nextNonce,
                    customNonceValue,
                    updateCustomNonce,
                    getNextNonce,
                  }),
                )
              }
              warning={submitWarning}
              txData={transaction}
              fromAddressIsLedger={fromAddressIsLedger}
              chainId={chainId}
              rpcPrefs={rpcPrefs}
              isContract={isContract}
              isMultiLayerFeeNetwork={isMultiLayerFeeNetwork}
              supportsEIP1559={supportsEIP1559}
              useCurrencyRateCheck={useCurrencyRateCheck}
            />
            {showCustomizeGasPopover && !supportsEIP1559 && (
              <EditGasPopover
                onClose={closeCustomizeGasPopover}
                mode={EditGasModes.modifyInPlace}
                transaction={transaction}
              />
            )}
            {supportsEIP1559 && (
              <>
                <EditGasFeePopover />
                <AdvancedGasFeePopover />
              </>
            )}
          </TransactionModalContextProvider>
        }
        hideSenderToRecipient
        customTxParamsData={customData}
        assetStandard={assetStandard}
        hideNavigation={hideNavigation}
        callbackCancel={callbackCancel}
        callbackCancelError={callbackCancelError}
        callbackSubmit={callbackSubmit}
        callbackSubmitError={callbackSubmitError}
      />
    </GasFeeContextProvider>
  );
}

ConfirmApprove.propTypes = {
  hideNavigation: PropTypes.bool,
  assetStandard: PropTypes.string,
  assetName: PropTypes.string,
  tokenAddress: PropTypes.string,
  userBalance: PropTypes.string,
  tokenSymbol: PropTypes.string,
  decimals: PropTypes.string,
  tokenImage: PropTypes.string,
  tokenAmount: PropTypes.string,
  tokenId: PropTypes.string,
  userAddress: PropTypes.string,
  toAddress: PropTypes.string,
  transaction: PropTypes.shape({
    origin: PropTypes.string,
    txParams: PropTypes.shape({
      data: PropTypes.string,
      to: PropTypes.string,
      from: PropTypes.string,
    }),
  }),
  ethTransactionTotal: PropTypes.string,
  fiatTransactionTotal: PropTypes.string,
  hexTransactionTotal: PropTypes.string,
  isSetApproveForAll: PropTypes.bool,
  nativeCurrency: PropTypes.string,
  nativeDecimals: PropTypes.number,
  callbackCancel: PropTypes.func,
  callbackCancelError: PropTypes.func,
  callbackSubmit: PropTypes.func,
  callbackSubmitError: PropTypes.func,
};
