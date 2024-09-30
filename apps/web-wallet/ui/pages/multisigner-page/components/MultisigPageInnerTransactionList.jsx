import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { multisigPropTypes } from '../../../components/app/multisigner-list/types';
import { getBalances } from '../../../ducks/metamask/metamask';
import { getMultisigTransactionsByAccount } from '../../../selectors';
import { MultisigPageInnerTransactionItem } from './MultisigPageInnerTransactionItem';

export const MultisigPageInnerTransactionList = ({ multisig }) => {
  const { id, account } = multisig;

  const list = useSelector(getMultisigTransactionsByAccount(id));

  // TODO: Use getAssetModel: const multisig = getAssetModel(localId, account)
  const tokens = useSelector((state) => getBalances(state, { multisig: true }));

  const token = useMemo(
    () =>
      tokens.find(
        ({ multisig: ms }) => ms?.account === account || ms?.id === id,
      ),
    [tokens, id, account],
  );

  return (
    <div className="multisig-page__transactions">
      <ul className="multisig-page__transactions__list">
        {Boolean(list.length) &&
          list.map((transaction) => (
            <MultisigPageInnerTransactionItem
              key={transaction.id}
              transaction={transaction}
              multisig={multisig}
              token={token}
            />
          ))}
      </ul>
    </div>
  );
};

MultisigPageInnerTransactionList.propTypes = {
  multisig: multisigPropTypes,
};
