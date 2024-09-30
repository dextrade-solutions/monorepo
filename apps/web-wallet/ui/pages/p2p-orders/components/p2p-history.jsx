import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';
import TransactionListItem from '../../../components/app/transaction-list-item/transaction-list-item.component';
import Button from '../../../components/ui/button';
import { p2pTransactionsSelector } from '../../../selectors';
import { ExchangerType } from '../../../../shared/constants/exchanger';

const PAGE_INCREMENT = 10;

export default function P2PHistory({
  types = [ExchangerType.P2PClient],
  unpaid,
  pending,
  completed,
}) {
  const [limit, setLimit] = useState(PAGE_INCREMENT);
  const t = useI18nContext();

  const filters = { types, unpaid, pending, completed };

  const pendingTransactions = useSelector((state) =>
    p2pTransactionsSelector(state),
  )({ ...filters, pending: true });
  const completedTransactions = useSelector((state) =>
    p2pTransactionsSelector(state),
  )({ ...filters, completed: true });

  const viewMore = useCallback(
    () => setLimit((prev) => prev + PAGE_INCREMENT),
    [],
  );

  return (
    <div className="transaction-list">
      <div className="transaction-list__transactions">
        {Boolean(pendingTransactions.length) && (
          <div className="transaction-list__pending-transactions">
            <div className="transaction-list__header">
              {`${t('queue')} (${pendingTransactions.length})`}
            </div>
            {pendingTransactions.map((transactionGroup, index) => (
              <TransactionListItem
                isEarliestNonce={index === 0}
                transactionGroup={transactionGroup}
                key={`${transactionGroup.nonce}:${index}`}
              />
            ))}
          </div>
        )}
        <div className="transaction-list__completed-transactions">
          {Boolean(pendingTransactions.length) && (
            <div className="transaction-list__header">{t('history')}</div>
          )}
          {completedTransactions.length > 0 ? (
            completedTransactions
              .slice(0, limit)
              .map((transactionGroup, index) => (
                <TransactionListItem
                  transactionGroup={transactionGroup}
                  key={`${transactionGroup.nonce}:${limit + index - 10}`}
                />
              ))
          ) : (
            <div className="transaction-list__empty">
              <div className="transaction-list__empty-text">
                {t('noTransactions')}
              </div>
            </div>
          )}
          {completedTransactions.length > limit && (
            <Button
              className="transaction-list__view-more"
              type="secondary"
              onClick={viewMore}
            >
              {t('viewMore')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

P2PHistory.propTypes = {
  types: PropTypes.array,
  unpaid: PropTypes.bool,
  pending: PropTypes.bool,
  completed: PropTypes.bool,
};
