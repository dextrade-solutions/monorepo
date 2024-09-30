import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import Collapse from '@material-ui/core/Collapse';
import Button from '../../../components/ui/button';
import { PRIMARY } from '../../../helpers/constants/common';
import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import { useCurrencyDisplay } from '../../../hooks/useCurrencyDisplay';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useUserPreferencedCurrency } from '../../../hooks/useUserPreferencedCurrency';
import { getCurrentCurrency } from '../../../selectors';
import {
  multisignTransactionDecline,
  multisignTransactionSign,
} from '../../../store/actions';

const statusTranslate = {
  PENDING: 'signingProcess',
  SIGNED: 'signed',
  ERROR: 'error',
  EXPIRED: 'expired',
  SEND: 'send',
  DECLINED: 'declined',
};

const ItemSignedTag = ({ status = 'PENDING', signStatus = 'WAIT' }) => {
  const t = useI18nContext();

  const renderStatus = useMemo(
    () => (status === 'PENDING' && signStatus !== 'WAIT' ? signStatus : status),
    [status, signStatus],
  );

  const inProcess = useMemo(
    () => status === 'PENDING' && signStatus !== 'SIGNED',
    [status, signStatus],
  );

  const isError = useMemo(
    () =>
      status === 'ERROR' || status === 'EXPIRED' || signStatus === 'DECLINED',
    [status, signStatus],
  );

  return (
    <div
      className={classnames('multisig-page__transactions__list-item__tag', {
        process: inProcess,
        error: isError,
      })}
    >
      <span>{t(statusTranslate[renderStatus])}</span>
    </div>
  );
};

const ItemSignedBy = ({ signersCount, totalSigners, minForBroadcasting }) => {
  const t = useI18nContext();
  return (
    <div className="multisig-page__transactions__list-item__row">
      <span className="multisig-page__transactions__list-item__text">
        {t('signedBy')}&#58;
      </span>
      <span>
        <span
          className={classnames('', {
            'multisig-page__token__script__highlight':
              signersCount >= minForBroadcasting,
          })}
        >
          {signersCount}
        </span>
        &nbsp;{t('from').toLowerCase()}&nbsp;{totalSigners}
      </span>
    </div>
  );
};

export const MultisigPageInnerTransactionItem = ({
  transaction,
  multisig,
  token,
}) => {
  const {
    amount,
    amountFiat = 0,
    fee = 0,
    feeFiat = 0,
    id: txId,
    toAddress,
    cdt = '',
    status = 'PENDING',
    signStatus = 'WAIT',
    signedCount,
    errorMessage,
  } = transaction;
  const { minForBroadcasting, totalSigners, provider } = multisig;

  const t = useI18nContext();
  const dispatch = useDispatch();
  const isPending = status === 'PENDING';
  const [open, setOpen] = useState(isPending);

  const isLoading = useSelector(({ appState }) => appState.isLoading);
  const currentCurrency = useSelector(getCurrentCurrency);

  const decimals = useMemo(() => token?.decimals || 100, [token]);

  const symbol = useMemo(() => token?.symbol || '', [token]);

  const primaryCurrencyPreferences = useUserPreferencedCurrency(PRIMARY);
  const [currency] = useCurrencyDisplay(amount.toString(), {
    ticker: symbol,
    shiftBy: decimals,
    isDecimal: true,
    hideLabel: true,
    ...primaryCurrencyPreferences,
  });

  const formattedCurrency = formatCurrency(
    amountFiat.toString(),
    currentCurrency,
  );
  const formattedFiat = formatCurrency(feeFiat.toString(), currentCurrency);

  const disableSignButton = useMemo(
    () => signStatus !== 'WAIT' || !isPending,
    [signStatus, isPending],
  );
  const disableCancelButton = useMemo(
    () => !isPending || signStatus === 'DECLINED',
    [signStatus, isPending],
  );

  const onSign = useCallback(() => {
    dispatch(
      multisignTransactionSign({
        txId,
        chain: provider.contract || provider.chainId,
      }),
    );
  }, [dispatch, txId, provider]);

  const onCancel = useCallback(() => {
    dispatch(
      multisignTransactionDecline({
        txId,
        chain: provider.contract || provider.chainId,
      }),
    );
  }, [dispatch, txId, provider]);

  const toggleOpen = useCallback(() => setOpen(!open), [open]);

  return (
    <div
      className="multisig-page__transactions__list-item"
      onClick={toggleOpen}
    >
      <div className="multisig-page__transactions__list-item__block">
        <div className="multisig-page__transactions__list-item__row">
          <span className="multisig-page__transactions__list-item__date">
            {cdt}
          </span>
          <ItemSignedTag status={status} signStatus={signStatus} />
        </div>
        <div className="multisig-page__transactions__list-item__row">
          <span className="multisig-page__transactions__list-item__text-sec">
            {t('recipientAddress')}&#58;
          </span>
        </div>
        <div className="multisig-page__transactions__list-item__row">
          <span className="multisig-page__transactions__list-item__text">
            {toAddress}
          </span>
        </div>
      </div>

      {!open && (
        <div className="multisig-page__transactions__list-item__collapsed">
          <span className="fas fa-ellipsis-h" />
        </div>
      )}

      <Collapse in={open}>
        {status === 'ERROR' && (
          <div className="multisig-page__transactions__list-item__block">
            <span className="multisig-page__transactions__list-item__text-error">
              {errorMessage}
            </span>
          </div>
        )}

        <div className="multisig-page__transactions__list-item__block">
          <div className="multisig-page__transactions__list-item__row">
            <span className="multisig-page__transactions__list-item__bold">
              {symbol}: {amount}
            </span>
            <span className="multisig-page__transactions__list-item__bold">
              {formattedCurrency}
            </span>
          </div>
          <ItemSignedBy
            minForBroadcasting={minForBroadcasting || totalSigners}
            signersCount={signedCount || 0}
            totalSigners={totalSigners}
          />
          <div className="multisig-page__transactions__list-item__row">
            <span className="multisig-page__transactions__list-item__text">
              {t('commission')}&#58;
            </span>
            <span className="multisig-page__transactions__list-item__text">
              {formattedFiat}&nbsp;
              <span className="multisig-page__transactions__list-item__bold">
                {fee}&nbsp;{symbol}
              </span>
            </span>
          </div>
        </div>

        {isPending && (
          <div className="multisig-page__transactions__list-item__block">
            <div className="multisig-page__transactions__list-item__actions">
              <Button
                type="inline"
                disabled={isLoading || disableSignButton}
                onClick={onSign}
              >
                {t('sign')}
              </Button>
              <Button
                type="inline"
                variant="danger"
                disabled={isLoading || disableCancelButton}
                onClick={onCancel}
                danger
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </Collapse>
    </div>
  );
};

ItemSignedTag.propTypes = {
  status: PropTypes.string.isRequired,
  signStatus: PropTypes.string.isRequired,
};

ItemSignedBy.propTypes = {
  signersCount: PropTypes.number.isRequired,
  totalSigners: PropTypes.number.isRequired,
  minForBroadcasting: PropTypes.number.isRequired,
};

MultisigPageInnerTransactionItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    cdt: PropTypes.string.isRequired,
    toSignCount: PropTypes.number.isRequired,
    toAddress: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    amountFiat: PropTypes.number.isRequired,
    signedCount: PropTypes.number.isRequired,
    sigHashes: PropTypes.arrayOf(PropTypes.string).isRequired,
    fee: PropTypes.string,
    feeFiat: PropTypes.string,
    status: PropTypes.string,
    signStatus: PropTypes.string,
    errorMessage: PropTypes.string,
  }).isRequired,
  multisig: PropTypes.object.isRequired,
  token: PropTypes.object.isRequired,
};
