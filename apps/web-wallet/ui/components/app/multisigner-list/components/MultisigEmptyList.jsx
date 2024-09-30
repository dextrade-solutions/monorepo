import React from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../../hooks/useI18nContext';

export const MultisigEmptyList = ({ list = [], isLoading = false }) => {
  const t = useI18nContext();
  return (
    <>
      {!list.length && !isLoading && (
        <div className="transaction-list__empty-text">
          {t('noMultisignature')}
        </div>
      )}
    </>
  );
};

MultisigEmptyList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
};
