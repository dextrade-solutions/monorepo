import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { EVENT } from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  getCurrentSmartTransactionsEnabled,
  getSmartTransactionsEnabled,
  getSmartTransactionsOptInStatus,
} from '../../../ducks/swaps/swaps';
import {
  getCurrentChainId,
  getHardwareWalletType,
  isHardwareWallet,
} from '../../../selectors';
import ImportToken from '../import-token';

export const SelectCoinsItemImportToken = ({
  tokenForImport,
  isImportTokenModalOpen,
  setTokenForImport,
  setIsImportTokenModalOpen,
  onSelect,
  onClose,
}) => {
  const trackEvent = useContext(MetaMetricsContext);
  const chainId = useSelector(getCurrentChainId);
  const hardwareWalletUsed = useSelector(isHardwareWallet);
  const hardwareWalletType = useSelector(getHardwareWalletType);
  const smartTransactionsEnabled = useSelector(getSmartTransactionsEnabled);
  const currentSmartTransactionsEnabled = useSelector(
    getCurrentSmartTransactionsEnabled,
  );
  const smartTransactionsOptInStatus = useSelector(
    getSmartTransactionsOptInStatus,
  );

  const onImportTokenClick = () => {
    trackEvent({
      event: 'Token Imported',
      category: EVENT.CATEGORIES.SWAPS,
      sensitiveProperties: {
        symbol: tokenForImport?.symbol,
        address: tokenForImport?.address,
        chain_id: chainId,
        is_hardware_wallet: hardwareWalletUsed,
        hardware_wallet_type: hardwareWalletType,
        stx_enabled: smartTransactionsEnabled,
        current_stx_enabled: currentSmartTransactionsEnabled,
        stx_user_opt_in: smartTransactionsOptInStatus,
      },
    });
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
      <ImportToken
        tokenForImport={tokenForImport}
        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
        onImportTokenClick={onImportTokenClick}
        onImportTokenCloseClick={onImportTokenCloseClick}
      />
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
