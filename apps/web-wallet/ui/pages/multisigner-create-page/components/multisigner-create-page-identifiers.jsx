import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { ButtonIcon, ICON_NAMES } from '../../../components/component-library';
import Tooltip from '../../../components/ui/tooltip';
import { Size } from '../../../helpers/constants/design-system';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getCreatorMultisigns } from '../../../selectors';
import { multisignRemove, showModal } from '../../../store/actions';

const SYMBOL_BY_CHAIN = {
  '0x38': 'BNB',
  '0x61': 'BNB',
  bitcoin: 'BTC',
  bitcoin_testnet: 'BTC',
};

const MultiSignatureCreatePageIdentifiersItem = (props) => {
  const { id, cdt = '', pubkeys, totalSigners, account, provider } = props;
  const t = useI18nContext();
  const [copied, onCopy] = useCopyToClipboard();
  const dispatch = useDispatch();

  const chain = useMemo(
    () => provider?.contract || provider?.chainId || '',
    [provider],
  );

  const symbol = useMemo(() => SYMBOL_BY_CHAIN[chain] || 'BNB', [chain]);

  const status = useMemo(
    () => (!account || totalSigners > pubkeys.length ? 'INIT' : 'CREATED'),
    [account, totalSigners, pubkeys],
  );

  const handleDelete = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      dispatch(
        showModal({
          name: 'CONFIRM_DELETE_MULTISIG',
          onConfirm: async () => dispatch(multisignRemove(id, chain)),
        }),
      );
    },
    [dispatch, id, chain],
  );

  const handleCopy = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      onCopy(id);
    },
    [onCopy, id],
  );

  return (
    <li
      key={id}
      className="multisig-create__identifiers__list-item"
      onClick={handleCopy}
    >
      <p className="multisig-create__identifiers__list-item__date">{cdt}</p>
      <div className="multisig-create__identifiers__list-item__content">
        <div className="multisig-create__identifiers__list-item__content__desc">
          <div className="multisig-create__identifiers__list-item__content__desc__symbol">
            <span>{symbol}&nbsp; </span>
            <span>{status}</span>
            <span>{t('xFromY', [pubkeys.length, totalSigners])}</span>
          </div>
          <span>{id}</span>
        </div>
        <div className="multisig-create__identifiers__list-item__content__actions">
          <Tooltip
            position="top"
            title={t(copied ? 'copiedExclamation' : 'copyToClipboard')}
          >
            <ButtonIcon
              size={Size.XS}
              iconName={copied ? ICON_NAMES.COPY_SUCCESS : ICON_NAMES.COPY}
              onClick={handleCopy}
              className="connected-accounts-options__button"
              ariaLabel={t('copiedExclamation')}
            />
          </Tooltip>
          <Tooltip position="top" title={t('delete')}>
            <ButtonIcon
              size={Size.XS}
              iconName={ICON_NAMES.CLOSE}
              className="connected-accounts-options__button"
              onClick={handleDelete}
              ariaLabel={t('delete')}
            />
          </Tooltip>
        </div>
      </div>
    </li>
  );
};

MultiSignatureCreatePageIdentifiersItem.propTypes = {
  id: PropTypes.string.isRequired,
  cdt: PropTypes.string,
  account: PropTypes.string,
  provider: PropTypes.shape({
    contract: PropTypes.string,
    chainId: PropTypes.string.isRequired,
  }).isRequired,
  pubkeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  totalSigners: PropTypes.number.isRequired,
};

export const MultisignerCreatePageIdentifiers = () => {
  const t = useI18nContext();
  const list = useSelector(getCreatorMultisigns);

  return (
    <div className="multisig-create__identifiers">
      {Boolean(list.length) && (
        <>
          <p className="multisig-create__identifiers__title">
            {t('listOfMultisignatureIdentifiers')}
          </p>
          <ul className="multisig-create__identifiers__list">
            {list.map((item) => (
              <MultiSignatureCreatePageIdentifiersItem
                key={item.id}
                {...item}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
