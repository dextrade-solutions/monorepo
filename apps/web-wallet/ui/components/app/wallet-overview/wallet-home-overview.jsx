import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { I18nContext } from '../../../contexts/i18n';
import {
  BUILD_QUOTE_ROUTE,
  EXCHANGER_FOR_APPROVAL,
  IMPORT_TOKEN_ROUTE,
  MULTISIG_CREATE_ROUTE,
} from '../../../helpers/constants/routes';
import { getAppIsLoading, getCurrentKeyring } from '../../../selectors';

import { isHardwareKeyring } from '../../../helpers/utils/hardware';
import { showModal } from '../../../store/actions';
import { ICON_NAMES } from '../../component-library';
import { FabButton } from '../../component-library/fab-button';
import WalletOverview from './wallet-overview';

const WalletHomeOverview = ({ className }) => {
  const t = useContext(I18nContext);
  const history = useHistory();
  const keyring = useSelector(getCurrentKeyring);
  const isLoading = useSelector(getAppIsLoading);
  const usingHardwareWallet = isHardwareKeyring(keyring?.type);

  return (
    <WalletOverview
      buttons={
        <>
          {/* <FabButton
            count={4}
            label="For approval"
            onClick={() => {
              history.push(EXCHANGER_FOR_APPROVAL);
            }}
          /> */}
          <FabButton
            iconName={ICON_NAMES.ADD}
            label={t('tokens')}
            onClick={() => {
              history.push(IMPORT_TOKEN_ROUTE);
            }}
            disabled={isLoading}
          />
          <FabButton
            iconName={ICON_NAMES.SWAP_HORIZONTAL}
            label={t('exchange')}
            onClick={() => {
              history.push(IMPORT_TOKEN_ROUTE);
              if (usingHardwareWallet) {
                global.platform.openExtensionInBrowser(BUILD_QUOTE_ROUTE);
              } else {
                history.push(BUILD_QUOTE_ROUTE);
              }
            }}
            disabled={isLoading}
          />
        </>
      }
      className={className}
    />
  );
};

WalletHomeOverview.propTypes = {
  className: PropTypes.string,
};

WalletHomeOverview.defaultProps = {
  className: undefined,
};

export default WalletHomeOverview;
