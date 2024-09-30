import PropTypes from 'prop-types';
import React, { memo, useCallback } from 'react';
import { IconColor, Size } from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ButtonIcon, ICON_NAMES } from '../../../component-library';
import Button from '../../../ui/button';

// TODO: create modal default layout component
const MultisigModalLayout = ({ children, title, onClose, onSubmit, disabledSubmit = false, textSubmit = '' }) => {
  const t = useI18nContext();

  const handleClose = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    onSubmit && onSubmit();
  }, [onSubmit]);

  return (
    <div className="multisig-modal-layout">
      <div className="multisig-modal-layout__header">
        <h4>{title}</h4>
        <ButtonIcon
          size={Size.XS}
          iconName={ICON_NAMES.CLOSE}
          color={IconColor.primaryDefault}
          onClick={handleClose}
          ariaLabel={t('close')}
        />
      </div>

      <div className="multisig-modal-layout__content">{children}</div>

      <div className="multisig-modal-layout__footer">
        <Button type="primary" onClick={handleSubmit} disabled={disabledSubmit}>
          {textSubmit || t('addId')}
        </Button>
        <Button type="inline" onClick={handleClose}>
          {t('close')}
        </Button>
      </div>
    </div>
  );
};

MultisigModalLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  disabledSubmit: PropTypes.bool,
  textSubmit: PropTypes.string,
};

export default memo(MultisigModalLayout);
