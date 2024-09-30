import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCoinIconByUid } from '../../../../shared/constants/tokens';
import Select from '../../../components/ui/select';
import Identicon from '../../../components/ui/identicon/identicon.container';
import { useAssets } from '../../../hooks/useAssets';
import { useCurrentTokens } from '../../../hooks/useCurrentTokens';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getMultisginerCreator } from '../../../selectors';
import { multisignSetToken } from '../../../store/actions';

const createOptionValue = ({ uid, account, symbol }) => (
  <div className="multisig-create__token__select__option">
    <Identicon diameter={32} address={account} image={getCoinIconByUid(uid)} />
    {symbol}
  </div>
);

export const MultisignerCreatePageTokenSelect = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const { tokens, token } = useSelector(getMultisginerCreator);
  const { findTokenByLocalId } = useCurrentTokens();

  const options = useMemo(() => {
    return tokens.reduce((acc, { localId, balance }) => {
      const tokenAsset = findTokenByLocalId(localId);
      if (!tokenAsset) {
        return acc;
      }
      const { symbol, uid, account } = tokenAsset;
      const opt = {
        label: createOptionValue({ symbol, uid, account }),
        // disabled: !Number(balance),
        value: localId,
      };
      acc = [...acc, opt];
      return acc;
    }, []);
  }, [tokens, findTokenByLocalId]);

  const handleSelect = useCallback(
    ({ value: selectedValue }) => {
      dispatch(multisignSetToken(selectedValue));
    },
    [dispatch],
  );

  return (
    <div className="multisig-create__token">
      <Select
        onChange={handleSelect}
        options={options}
        value={token?.localId || null}
        placeholder={t('cryptoSelectorPlaceholder')}
      />
    </div>
  );
};
