import React, { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';

import { MultisignerPageLayout } from '../../multisigner-create-page/multisigner-page-layout';
import { MultisigPageInnerMenuActions } from './MultisigPageInnerMenuActions';
import { MultisigPageAddress } from './MultisigPageAddress';
import { MultisigPageScript } from './MultisigPageScript';
import { MultisigPageToken } from './MultisigPageToken';
import { MultisigPageInnerTransactionList } from './MultisigPageInnerTransactionList';

export const MultisigPageInner = ({ multisig = {}, token = {} }) => {
  const {
    id,
    totalSigners,
    pubkeys = [],
    account,
    minForBroadcasting,
  } = multisig;
  const {
    symbol = '',
    decimals = 100,
    balance = '0x',
    balanceFiat = '0x',
  } = token;

  const t = useI18nContext();
  const history = useHistory();

  const inProcess = useMemo(
    () => !token || pubkeys.length < minForBroadcasting || !account,
    [token, pubkeys, minForBroadcasting, account],
  );

  const handleBack = useCallback(() => {
    history.push(DEFAULT_ROUTE);
  }, [history]);

  return (
    <MultisignerPageLayout
      onBack={handleBack}
      onCancel={handleBack}
      title={t('multiSignatureCard')}
      className="multisig-page__layout"
    >
      <div className="multisig-page">
        {totalSigners > pubkeys.length && <MultisigPageAddress account={id} />}
        {Boolean(account) && <MultisigPageAddress account={account} />}
        <div className="multisig-page__token--wrapper">
          <div className="multisig-page__token">
            <MultisigPageScript
              of={totalSigners}
              added={pubkeys?.length}
              highlight={
                symbol === 'BTC'
                  ? pubkeys?.length >= minForBroadcasting
                  : pubkeys?.length === totalSigners
              }
            />
            {token && (
              <MultisigPageToken
                balance={balance}
                symbol={symbol}
                decimals={decimals}
                balanceFiat={balanceFiat}
              />
            )}
          </div>
          <MultisigPageInnerMenuActions
            multisig={multisig}
            token={token}
            inProcess={inProcess}
          />
        </div>
        {!inProcess && <MultisigPageInnerTransactionList multisig={multisig} />}
      </div>
    </MultisignerPageLayout>
  );
};
