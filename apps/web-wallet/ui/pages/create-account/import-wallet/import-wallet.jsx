import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';

import SrpInput from '../../../components/app/srp-input/srp-input';
import PageContainer from '../../../components/ui/page-container';
import { getMostRecentOverviewPage } from '../../../ducks/history/history';
import Box from '../../../components/ui/box';
import { addNewAccount } from '../../../store/actions';

export default function ImportWallet() {
  const t = useI18nContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const [seedPhrase, setSeedPhrase] = useState();
  const isValid = seedPhrase;

  return (
    <PageContainer
      title={t('importWallet')}
      subtitle={t('importWalletSubtitle')}
      disabled={!isValid}
      onCancel={() => {
        history.push(mostRecentOverviewPage);
      }}
      onSubmit={() => {
        dispatch(addNewAccount(seedPhrase)).then(() => {
          history.push(mostRecentOverviewPage);
        });
      }}
      submitText={t('create')}
      contentComponent={
        <Box margin={3}>
          <SrpInput
            onChange={setSeedPhrase}
            srpText={t('secretRecoveryPhrase')}
          />
        </Box>
      }
    />
  );
}
