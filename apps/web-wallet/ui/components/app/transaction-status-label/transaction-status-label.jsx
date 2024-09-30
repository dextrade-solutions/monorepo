import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Tooltip from '../../ui/tooltip';

import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  TransactionGroupStatus,
  TransactionStatus,
} from '../../../../shared/constants/transaction';

const QUEUED_PSEUDO_STATUS = 'queued';

/**
 * A note about status logic for this component:
 * Approved, Signed and Submitted statuses are all treated, effectively
 * as pending. Transactions are only approved or signed for less than a
 * second, usually, and ultimately should be rendered in the UI no
 * differently than a pending transaction.
 *
 * Confirmed transactions are not especially highlighted except that their
 * status label will be the date the transaction was finalized.
 */
const pendingStatusHash = {
  [TransactionStatus.submitted]: TransactionGroupStatus.pending,
  [TransactionStatus.approved]: TransactionGroupStatus.pending,
  [TransactionStatus.signed]: TransactionGroupStatus.pending,
};

const statusToClassNameHash = {
  [TransactionStatus.unapproved]: 'transaction-status-label--unapproved',
  [TransactionStatus.rejected]: 'transaction-status-label--rejected',
  [TransactionStatus.failed]: 'transaction-status-label--failed',
  [TransactionStatus.expired]: 'transaction-status-label--expired',
  [TransactionStatus.dropped]: 'transaction-status-label--dropped',
  [TransactionStatus.refunded]: 'transaction-status-label--dropped',
  [TransactionGroupStatus.cancelled]: 'transaction-status-label--cancelled',
  [QUEUED_PSEUDO_STATUS]: 'transaction-status-label--queued',
  [TransactionGroupStatus.pending]: 'transaction-status-label--pending',
};

export default function TransactionStatusLabel({
  status,
  subStatus,
  date,
  error,
  className,
  statusOnly,
}) {
  const t = useI18nContext();
  const tooltipText = error?.rpc?.message || error?.message;
  let statusKey = status;
  if (pendingStatusHash[status]) {
    statusKey = TransactionGroupStatus.pending;
  }

  const statusText =
    statusKey === TransactionStatus.confirmed && !statusOnly
      ? date
      : statusKey && t(statusKey);

  // TODO: locale sub status
  const subStatusText = [
    TransactionStatus.confirmed,
    TransactionStatus.failed,
  ].includes(statusKey)
    ? null
    : subStatus || '';

  return (
    <Tooltip
      position="top"
      title={tooltipText}
      wrapperClassName={classnames(
        'transaction-status-label',
        `transaction-status-label--${statusKey}`,
        className,
        statusToClassNameHash[statusKey],
      )}
    >
      {statusText}
      {subStatusText && <>&nbsp;[{subStatusText}]</>}
    </Tooltip>
  );
}

TransactionStatusLabel.propTypes = {
  status: PropTypes.string,
  subStatus: PropTypes.string,
  className: PropTypes.string,
  date: PropTypes.string,
  error: PropTypes.object,
  isEarliestNonce: PropTypes.bool,
  statusOnly: PropTypes.bool,
};
