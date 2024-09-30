import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useHistory } from 'react-router-dom';
import {
  CONFIRM_APPROVE_PATH,
  CONFIRM_SAFE_TRANSFER_FROM_PATH,
  CONFIRM_SEND_TOKEN_PATH,
  CONFIRM_SET_APPROVAL_FOR_ALL_PATH,
  CONFIRM_TRANSACTION_ROUTE,
  CONFIRM_TRANSFER_FROM_PATH,
  SEND_ROUTE,
} from '../../helpers/constants/routes';
import { transactionFeeSelector } from '../../selectors';
import ConfirmApprove from '../confirm-approve';
import ConfirmSendToken from '../confirm-send-token';
import ConfirmTokenTransactionBase from '../confirm-token-transaction-base';
import ConfirmTransactionSwitch from '../confirm-transaction-switch';
import { editExistingTransaction } from '../../ducks/send';
import { AssetType } from '../../../shared/constants/transaction';
import { clearConfirmTransaction } from '../../ducks/confirm-transaction/confirm-transaction.duck';

import { calcTokenAmount } from '../../../shared/lib/transactions-controller-utils';
import { useAsset } from '../../hooks/useAsset';

export default function ConfirmTokenTransactionSwitch({ transaction }) {
  const {
    txParams: { data, localId, to: tokenAddress, from: userAddress } = {},
    source,
    destination,
  } = transaction;

  const dispatch = useDispatch();
  const history = useHistory();

  const asset = useAsset(localId);

  const assetStandard = asset.standard;
  const assetName = asset.name;
  const userBalance = asset.balance;
  const { decimals } = asset;
  const tokenImage = asset.getIconUrl();
  const tokenSymbol = asset.symbol;

  const { nativeToken } = asset.sharedProvider;

  const nativeDecimals = nativeToken.decimals;
  const nativeCurrency = nativeToken.symbol;

  const {
    toAddress,
    tokenAmount: tokenAmountString,
    tokenId,
  } = asset.sharedProvider.parseTokenTransferData(data);

  let tokenAmount;
  if (tokenAmountString) {
    tokenAmount = calcTokenAmount(tokenAmountString, decimals);
  }

  const {
    ethTransactionTotal,
    fiatTransactionTotal,
    hexTransactionTotal,
    hexMaximumTransactionFee,
  } = useSelector((state) => transactionFeeSelector(state, transaction));

  return (
    <Switch>
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_APPROVE_PATH}`}
        render={() => (
          <ConfirmApprove
            assetStandard={assetStandard}
            assetName={assetName}
            userBalance={userBalance}
            tokenSymbol={tokenSymbol}
            decimals={decimals}
            tokenImage={tokenImage}
            tokenAmount={tokenAmount}
            tokenId={tokenId}
            userAddress={userAddress}
            tokenAddress={tokenAddress}
            toAddress={toAddress}
            transaction={transaction}
            ethTransactionTotal={ethTransactionTotal}
            fiatTransactionTotal={fiatTransactionTotal}
            hexTransactionTotal={hexTransactionTotal}
            nativeCurrency={nativeCurrency}
            nativeDecimals={nativeDecimals}
            isSwapApprove={source && destination}
          />
        )}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_SET_APPROVAL_FOR_ALL_PATH}`}
        render={() => (
          <ConfirmApprove
            isSetApproveForAll
            assetStandard={assetStandard}
            assetName={assetName}
            userBalance={userBalance}
            tokenSymbol={tokenSymbol}
            decimals={decimals}
            tokenImage={tokenImage}
            tokenAmount={tokenAmount}
            tokenId={tokenId}
            userAddress={userAddress}
            tokenAddress={tokenAddress}
            toAddress={toAddress}
            transaction={transaction}
            ethTransactionTotal={ethTransactionTotal}
            fiatTransactionTotal={fiatTransactionTotal}
            hexTransactionTotal={hexTransactionTotal}
            nativeCurrency={nativeCurrency}
            nativeDecimals={nativeDecimals}
          />
        )}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_TRANSFER_FROM_PATH}`}
        render={() => (
          <ConfirmTokenTransactionBase
            assetStandard={assetStandard}
            assetName={assetName}
            userBalance={userBalance}
            tokenSymbol={tokenSymbol}
            decimals={decimals}
            image={tokenImage}
            tokenAddress={tokenAddress}
            onEdit={async ({ txData }) => {
              const { id } = txData;
              await dispatch(
                editExistingTransaction(AssetType.NFT, id.toString()),
              );
              dispatch(clearConfirmTransaction());
              history.push(SEND_ROUTE);
            }}
            toAddress={toAddress}
            tokenAmount={tokenAmount}
            tokenId={tokenId}
            userAddress={userAddress}
            transaction={transaction}
            ethTransactionTotal={ethTransactionTotal}
            fiatTransactionTotal={fiatTransactionTotal}
            hexMaximumTransactionFee={hexMaximumTransactionFee}
            nativeCurrency={nativeCurrency}
            nativeDecimals={nativeDecimals}
          />
        )}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_SAFE_TRANSFER_FROM_PATH}`}
        render={() => (
          <ConfirmTokenTransactionBase
            assetStandard={assetStandard}
            assetName={assetName}
            userBalance={userBalance}
            tokenSymbol={tokenSymbol}
            decimals={decimals}
            image={tokenImage}
            tokenAddress={tokenAddress}
            toAddress={toAddress}
            tokenAmount={tokenAmount}
            tokenId={tokenId}
            userAddress={userAddress}
            transaction={transaction}
            ethTransactionTotal={ethTransactionTotal}
            fiatTransactionTotal={fiatTransactionTotal}
            hexMaximumTransactionFee={hexMaximumTransactionFee}
            nativeCurrency={nativeCurrency}
            nativeDecimals={nativeDecimals}
          />
        )}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_SEND_TOKEN_PATH}`}
        render={() => (
          <ConfirmSendToken
            assetStandard={assetStandard}
            assetName={assetName}
            tokenSymbol={tokenSymbol}
            image={tokenImage}
            tokenAddress={tokenAddress}
            toAddress={toAddress}
            tokenAmount={tokenAmount}
            tokenId={tokenId}
            transaction={transaction}
            ethTransactionTotal={ethTransactionTotal}
            fiatTransactionTotal={fiatTransactionTotal}
            hexMaximumTransactionFee={hexMaximumTransactionFee}
            nativeCurrency={nativeCurrency}
            nativeDecimals={nativeDecimals}
          />
        )}
      />
      <Route path="*" component={ConfirmTransactionSwitch} />
    </Switch>
  );
}

ConfirmTokenTransactionSwitch.propTypes = {
  transaction: PropTypes.shape({
    origin: PropTypes.string,
    source: PropTypes.object,
    destination: PropTypes.object,
    txParams: PropTypes.shape({
      data: PropTypes.string,
      to: PropTypes.string,
      from: PropTypes.string,
    }),
  }),
};
