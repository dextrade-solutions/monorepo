import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { getBalances } from '../../ducks/metamask/metamask';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import { getMultisigById, getSelectedAddress } from '../../selectors';
import { MultisigPageInner } from './components/MultisigPageInner';

export const MultisignerPage = () => {
  const history = useHistory();
  const { id } = useParams();

  const selectedAddress = useSelector(getSelectedAddress);
  const multisig = useSelector(getMultisigById(id));

  const tokens = useSelector((state) => getBalances(state, { multisig: true }));
  const token = useMemo(
    () =>
      tokens.find(
        (t) =>
          t?.multisig?.account === multisig.account ||
          t?.multisig?.id === multisig.id,
      ),
    [multisig, tokens],
  );

  const handleHome = useCallback(() => {
    history.push(DEFAULT_ROUTE);
  }, [history]);

  useEffect(() => {
    if (!id || !multisig) {
      handleHome();
    }
  }, [id, multisig, handleHome, selectedAddress]);

  return <MultisigPageInner multisig={multisig} token={token} />;
};

export default memo(MultisignerPage);
