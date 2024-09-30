import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { getMultisigTransactionsByAccount } from '../../../../selectors';
import { multisigPropTypes } from '../types';

export const MultisigListItemScript = (props) => {
  const { inProcess, multisig = {} } = props;
  const {
    minForBroadcasting: min,
    totalSigners: total,
    id,
    pubkeys = [],
  } = multisig;

  const t = useI18nContext();
  const transactions = useSelector(getMultisigTransactionsByAccount(id));

  // const txCount = transactions.reduce(
  //   (acc, { signStatus = '', toSignCount }) => {
  //     if (signStatus === 'WAIT' && Boolean(toSignCount)) {
  //       acc += 1;
  //     }
  //
  //     return acc;
  //   },
  //   0,
  // );

  const txCount = transactions.reduce((acc, { status = '' }) => {
    if (status !== 'PENDING') {
      return acc;
    }

    acc += 1;
    return acc;
  }, 0);

  return (
    <div className="multisig-list__item__script__wrapper">
      <div className="multisig-list__item__script">
        {inProcess && (
          <span className="multisig-list__item__script__process">
            {t('creationProcess')}
          </span>
        )}

        <div className="multisig-list__item__script__desc">
          <span>{t('multiSignatureScript')}&#58;</span>
          <span>{t('xFromY', [min, total]).toLowerCase()}</span>
        </div>

        {inProcess ? (
          <div className="multisig-list__item__script__desc">
            <span>{t('addedSignatures')}&#58;</span>
            <span className="multisig-list__item__script__desc__added">
              {pubkeys.length}&nbsp;
              {t('from').toLowerCase()}&nbsp;
              {total}
            </span>
          </div>
        ) : (
          <div className="multisig-list__item__script__desc">
            <span>{t('activeSignatureRransactions')}&#58;</span>
            <span className="multisig-list__item__script__desc__badge">
              {txCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

MultisigListItemScript.propTypes = {
  multisig: multisigPropTypes,
  inProcess: PropTypes.bool.isRequired,
};
