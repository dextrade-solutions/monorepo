import classnames from 'classnames';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/ui/button';
import { useI18nContext } from '../../hooks/useI18nContext';

// TODO: create default page layout
export const MultisignerPageLayout = ({
  children,
  onBack,
  onCancel,
  title,
  footer,
  className,
}) => {
  const t = useI18nContext();
  const handleClickBack = useCallback(
    (e) => {
      e && e.preventDefault();
      onBack && onBack();
    },
    [onBack],
  );
  const handleClickCancel = useCallback(
    (e) => {
      e && e.preventDefault();
      onCancel && onCancel();
    },
    [onCancel],
  );

  return (
    <div className={classnames('multisig-create-layout__container', className)}>
      <div className="multisig-create-layout">
        <div className="multisig-create-layout__head">
          <Button type="inline" onClick={handleClickBack}>
            {'<'}&nbsp;&nbsp;{t('back')}
          </Button>
          <span className="multisig-create-layout__head__title">{title}</span>
          <Button type="inline" onClick={handleClickCancel}>
            {t('cancel')}
          </Button>
        </div>
        <div className="multisig-create-layout__content">{children}</div>
        {footer && (
          <div className="multisig-create-layout__footer">{footer}</div>
        )}
      </div>
    </div>
  );
};

MultisignerPageLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  onBack: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
};

MultisignerPageLayout.defaultProps = {
  footer: null,
  children: null,
  title: '',
  className: '',
};
