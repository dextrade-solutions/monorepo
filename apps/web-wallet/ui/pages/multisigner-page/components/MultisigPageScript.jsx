import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';

export const MultisigPageScript = ({ of, added, highlight }) => {
  const t = useI18nContext();
  return (
    <div className="multisig-page__token__script">
      <span>{t('addedSignatures')}&#58;</span>
      <span>
        <span
          className={classnames('multisig-page__token__script__added', {
            highlight,
          })}
        >
          {added}
        </span>
        &nbsp;{t('from').toLowerCase()}&nbsp;{of}
      </span>
    </div>
  );
};

MultisigPageScript.propTypes = {
  of: PropTypes.number.isRequired,
  added: PropTypes.number.isRequired,
  highlight: PropTypes.bool,
};
