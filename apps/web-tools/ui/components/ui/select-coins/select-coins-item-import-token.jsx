import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
// import ImportToken from '../import-token';

export const SelectCoinsItemImportToken = ({
  tokenForImport,
  isImportTokenModalOpen,
  setTokenForImport,
  setIsImportTokenModalOpen,
  onSelect,
  onClose,
}) => {
  const onImportTokenClick = () => {
    onSelect?.(tokenForImport);
    setTokenForImport(null);
    onClose();
  };

  const onImportTokenCloseClick = () => {
    setIsImportTokenModalOpen(false);
    onClose();
  };

  if (!tokenForImport || !isImportTokenModalOpen) {
    return null;
  }

  return (
    <>
      {/* <ImportToken
        tokenForImport={tokenForImport}
        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
        onImportTokenClick={onImportTokenClick}
        onImportTokenCloseClick={onImportTokenCloseClick}
      /> */}
    </>
  );
};

SelectCoinsItemImportToken.propTypes = {
  tokenForImport: PropTypes.object,
  isImportTokenModalOpen: PropTypes.bool,
  setTokenForImport: PropTypes.func,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
  setIsImportTokenModalOpen: PropTypes.func,
};
