import React, { memo, useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getCoinIconByUid } from '../../../../shared/constants/tokens';
import { AssetType } from '../../../../shared/constants/transaction';
import { ICON_NAMES } from '../../../components/component-library';
import { Menu, MenuItem } from '../../../components/ui/menu';
import { getBalances } from '../../../ducks/metamask/metamask';
import { startNewMultisignTransactions } from '../../../ducks/send';
import { INVALID_ASSET_TYPE } from '../../../helpers/constants/error-keys';
import {
  DEFAULT_ROUTE,
  MULTISIG_ROUTE,
} from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { multisignRemove, showModal } from '../../../store/actions';

// eslint-disable-next-line
const MenuActionsList = memo((props) => {
  const {
    anchorElement,
    onClose,
    isOpen,
    inProcess = false,
    onDelete,
    onView,
    onSend,
    disabledSend,
  } = props;
  const t = useI18nContext();

  if (!isOpen) {
    return null;
  }

  return (
    <Menu
      anchorElement={anchorElement}
      className="account-options-menu"
      onHide={onClose}
    >
      {!inProcess && (
        <MenuItem onClick={onView} iconName={ICON_NAMES.WALLET} type="primary">
          {t('expandView')}
        </MenuItem>
      )}
      {!disabledSend && (
        <MenuItem
          onClick={onSend}
          iconName={ICON_NAMES.ARROW_2_RIGHT}
          type="primary"
        >
          {t('send')}
        </MenuItem>
      )}
      <MenuItem onClick={onDelete} iconName={ICON_NAMES.TRASH} type="danger">
        {t('delete')}
      </MenuItem>
    </Menu>
  );
});

export const MultisigPageInnerMenuActions = ({
  inProcess: proccess,
  multisig = {},
  token = {},
}) => {
  const { provider, id, account } = multisig;
  const history = useHistory();
  const dispatch = useDispatch();
  const ref = useRef();
  const [open, setOpen] = useState(false);

  const inProcess = useMemo(
    () => proccess || !Object.keys(token).length,
    [proccess, token],
  );

  const chain = useMemo(
    () => provider?.contract || provider?.chainId || '',
    [provider],
  );

  const userTokens = useSelector(getBalances);

  const symbol = useMemo(() => token?.symbol || 'BTC', [token]);

  const details = useMemo(() => {
    if (inProcess) {
      return {};
    }
    return {
      provider: token.multisig?.provider || token.provider || {},
      balance: token.balance,
      account,
      decimals: token.decimals,
      symbol: token.symbol,
      image: getCoinIconByUid(token?.uid || ''),
      network: token.network,
    };
  }, [inProcess, token, account]);

  const subDetails = useMemo(
    () =>
      userTokens.find(
        (ust) =>
          (ust.provider?.contract === token?.provider?.contract &&
            ust.provider?.chainId === token?.provider?.chainId) ||
          '',
      ),
    [token, userTokens],
  );

  const handleClose = useCallback(() => setOpen(false), []);

  const handleDelete = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      handleClose();
      dispatch(
        showModal({
          name: 'CONFIRM_DELETE_MULTISIG',
          onConfirm: async () => {
            await dispatch(multisignRemove(id, chain));
            history.push(DEFAULT_ROUTE);
          },
        }),
      );
    },
    [handleClose, history, dispatch, id, chain],
  );

  const handleModalView = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      handleClose();
      if (inProcess) {
        return null;
      }
      return dispatch(
        showModal({
          name: 'MULTISIG_ACCOUNT_DETAILS',
          token: {
            ...details,
            ...token,
            name: `Multisign ${symbol}`,
            account,
          },
          id,
        }),
      );
    },
    [handleClose, details, symbol, account, dispatch, token, id, inProcess],
  );

  const handleSend = useCallback(
    async (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      handleClose();
      if (inProcess) {
        return;
      }

      try {
        await dispatch(
          startNewMultisignTransactions({
            type: token?.provider?.contract
              ? AssetType.token
              : AssetType.native,
            isMultisign: true,
            details,
            subDetails,
            id,
          }),
        );
        history.push(`${MULTISIG_ROUTE}/${id}/send`);
      } catch (err) {
        if (!err.message.includes(INVALID_ASSET_TYPE)) {
          throw err;
        }
      }
    },
    [handleClose, id, inProcess, dispatch, details, history, token, subDetails],
  );

  return (
    <div className="multisig-page__menu">
      <button
        className="fas fa-ellipsis-v exchanger-view-header__menu-btn"
        title="settings"
        ref={ref}
        onClick={() => setOpen(true)}
      />
      {open && (
        <MenuActionsList
          isOpen={open}
          onClose={handleClose}
          anchorElement={ref?.current}
          inProcess={inProcess}
          onDelete={handleDelete}
          onView={handleModalView}
          onSend={handleSend}
          disabledSend={inProcess || !token?.balance}
        />
      )}
    </div>
  );
};
