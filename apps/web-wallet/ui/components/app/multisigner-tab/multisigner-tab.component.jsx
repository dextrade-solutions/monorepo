import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { MULTISIG_CREATE_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  getMultisginerLoading,
  getSortedAllMultisignsList,
} from '../../../selectors';
import {
  hideLoadingIndication,
  showLoadingIndication,
  showModal,
} from '../../../store/actions';
import { ICON_NAMES } from '../../component-library';
import { FabButton } from '../../component-library/fab-button';
import Spinner from '../../ui/spinner';
import MultisignerList from '../multisigner-list';
// import { MultisignerTabFilter } from './components/multisigner-tab-filter';

export const MultisignerTab = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const isLoading = useSelector(getMultisginerLoading);

  const list = useSelector(getSortedAllMultisignsList);

  const renderList = useMemo(() => (isLoading ? [] : list), [isLoading, list]);

  const addMultisig = useCallback(() => {
    dispatch(showModal({ name: 'MULTISIG_ADD' }));
  }, [dispatch]);

  const createMultisig = useCallback(() => {
    history.push(MULTISIG_CREATE_ROUTE);
  }, [history]);

  // useEffect(() => {
  //   if (isLoading) {
  //     dispatch(showLoadingIndication());
  //   } else {
  //     dispatch(hideLoadingIndication());
  //   }
  //   return () => {
  //     dispatch(hideLoadingIndication());
  //   };
  // }, [dispatch, isLoading]);

  return (
    <div className="multisigner-tab">
      {isLoading && (
        <div className="multisigner-tab__loader">
          <Spinner
            color="var(--color-warning-default)"
            className="loading-overlay__spinner"
          />
        </div>
      )}
      <div className="multisigner-tab__actions">
        <FabButton
          iconName={ICON_NAMES.ADD}
          label={t('multisigJoin')}
          onClick={addMultisig}
          disabled={isLoading}
        />
        <FabButton
          iconName={ICON_NAMES.CREATE}
          label={t('multisigCreate')}
          onClick={createMultisig}
          disabled={isLoading}
        />
      </div>
      {/*{Boolean(renderList.length) && <MultisignerTabFilter />}*/}
      <MultisignerList list={renderList} />
    </div>
  );
};

export default memo(MultisignerTab);
