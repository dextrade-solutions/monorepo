import React, { useEffect, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/ui/button';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';
import { getMultisginerCreator } from '../../selectors';
import {
  multisignGenerate,
  multisignMount,
  multisignSetToken,
  multisignUnmount,
} from '../../store/actions';
import { MultisignerCreateInputs } from './components/multisigner-create-inputs';
import { MultisignerCreateScript } from './components/multisigner-create-script';
import { MultisignerPageLayout } from './multisigner-page-layout';
import { MultisignerCreatePageTokenSelect } from './components/multisigner-create-page-token-select';
import { MultisignerCreatePageIdentifiers } from './components/multisigner-create-page-identifiers';

export default function MultisignerCreatePage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const t = useI18nContext();

  const creator = useSelector(getMultisginerCreator);
  const { tokens, token, minForBroadcasting, totalSigners } = creator;

  const disabledGenerate = useMemo(
    () =>
      !tokens?.length ||
      !token ||
      !token.localId ||
      !totalSigners ||
      !minForBroadcasting,
    [tokens, token, totalSigners, minForBroadcasting],
  );

  const handleBack = useCallback(() => {
    history.push(DEFAULT_ROUTE);
  }, [history]);

  const handleCancel = useCallback(() => {
    if (!token) {
      return handleBack();
    }
    return dispatch(multisignSetToken(null));
  }, [dispatch, token, handleBack]);

  const handleGenerate = useCallback(async () => {
    await dispatch(multisignGenerate());
    handleBack();
  }, [dispatch, handleBack]);

  useEffect(() => {
    dispatch(multisignMount());
    return () => {
      dispatch(multisignUnmount());
    };
  }, [dispatch]);

  return (
    <MultisignerPageLayout
      onBack={handleBack}
      onCancel={handleCancel}
      title={token?.name || t('createMultiSignature')}
      footer={
        <Button
          type="primary"
          className="multisig-create__footer__submit"
          onClick={handleGenerate}
          disabled={disabledGenerate}
        >
          {t('generate')}
        </Button>
      }
    >
      <div className="multisig-create">
        {Boolean(tokens?.length) && <MultisignerCreatePageTokenSelect />}

        {Boolean(token) && <MultisignerCreateScript />}

        <MultisignerCreateInputs />

        <MultisignerCreatePageIdentifiers />
      </div>
    </MultisignerPageLayout>
  );
}
