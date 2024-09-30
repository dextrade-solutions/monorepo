import React, { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
// eslint-disable-next-line import/named
import { sendMultisignTransactions } from '../../ducks/send';
import { MULTISIG_ROUTE } from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';
import Send from '../send';

const MultiSignatureSendPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const t = useI18nContext();

  const handleSubmit = useCallback(
    async (e) => {
      e && e.preventDefault();
      try {
        await dispatch(sendMultisignTransactions(id));
        history.push(`${MULTISIG_ROUTE}/${id}`);
      } catch (err) {
        console.err(err);
      }
    },
    [dispatch, id, history],
  );

  return <Send onSubmit={handleSubmit} submitText={t('send')} />;
};

export default memo(MultiSignatureSendPage);
