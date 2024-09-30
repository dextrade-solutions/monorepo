import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getMultisginerCreator } from '../../../selectors';

const inputTokenRender = ['0x1', '0x5'];

export const MultisignerCreateInputs = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const creator = useSelector(getMultisginerCreator);

  const { tokens, token, minForBroadcasting, totalSigners } = creator;

  const showBlock = useMemo(() => {
    return (
      minForBroadcasting &&
      totalSigners &&
      Boolean(token) &&
      Boolean(token.localId) &&
      inputTokenRender.includes(token.localId.split(':')[0])
    );
  }, [minForBroadcasting, totalSigners, token]);

  if (!showBlock) {
    return null;
  }

  return (
    <div className="multisig-create__signatures__container">
      Inputs
      <div>input</div>
      <div>input</div>
      <div>input</div>
      <div>input</div>
    </div>
  );
};
