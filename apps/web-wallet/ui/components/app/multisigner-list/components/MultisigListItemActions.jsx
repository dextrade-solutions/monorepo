import React from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ICON_NAMES } from '../../../component-library';
import { MultisigListItemAction } from './MultisigListItemAction';

export const MultisigListItemActions = ({
  inProcess,
  onModal,
  onSend,
  balance,
}) => {
  const t = useI18nContext();

  // TODO: uncomment next code
  // const renderSendButton = !inProcess && Boolean(Number(balance));
  const renderSendButton = !inProcess;

  return (
    <div className="multisig-list__item__actions">
      {inProcess && (
        <span className="multisig-list__item__actions__process">
          {t('creationProcess')}
        </span>
      )}
      <div className="multisig-list__item__actions__wrapper">
        {!inProcess && (
          <MultisigListItemAction
            iconName={ICON_NAMES.WALLET}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onModal(e);
            }}
            title={t('expandView')}
          />
        )}
        {renderSendButton && (
          <MultisigListItemAction
            iconName={ICON_NAMES.ARROW_2_RIGHT}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSend(e);
            }}
            title={t('send')}
          />
        )}
      </div>
    </div>
  );
};

MultisigListItemActions.propTypes = {
  onModal: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  inProcess: PropTypes.bool.isRequired,
  balance: PropTypes.string,
};
