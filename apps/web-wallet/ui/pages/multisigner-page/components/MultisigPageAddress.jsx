import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from '../../../components/ui/tooltip';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { useI18nContext } from '../../../hooks/useI18nContext';

export const MultisigPageAddress = ({ account }) => {
  const [copied, handleCopy] = useCopyToClipboard();
  const t = useI18nContext();

  return (
    <div className="multisig-page__address">
      <Tooltip
        position="bottom"
        title={copied ? t('copiedExclamation') : t('copyToClipboard')}
      >
        <div
          className="multisig-page__address__number"
          onClick={() => handleCopy(account)}
        >
          {account}
        </div>
      </Tooltip>
    </div>
  );
};

MultisigPageAddress.propTypes = {
  account: PropTypes.string.isRequired,
};
