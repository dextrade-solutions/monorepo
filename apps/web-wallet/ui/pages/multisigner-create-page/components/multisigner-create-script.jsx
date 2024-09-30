import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from '../../../components/ui/select';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getMultisginerCreator } from '../../../selectors';
import { multisignSetTokenScript } from '../../../store/actions';

const options = Array.from(Array(11).keys()).map((el) => {
  const value = el + 2;
  const label = value.toString();
  return { label, value };
});

const scriptSelectList = ['totalSigners', 'minForBroadcasting'];

const titles = {
  totalSigners: 'totalNumberOfSignatures',
  minForBroadcasting: 'signaturesForTheTransaction',
};

export const MultisignerCreateScript = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const { totalSigners, minForBroadcasting } = useSelector(
    getMultisginerCreator,
  );

  const values = useMemo(
    () => ({ totalSigners, minForBroadcasting }),
    [totalSigners, minForBroadcasting],
  );

  const disabledKeys = useMemo(() => {
    return scriptSelectList.reduce((acc, key) => {
      acc[key] = false;
      if (key === 'minForBroadcasting') {
        acc[key] = values.totalSigners === null;
      }
      return acc;
    }, {});
  }, [values]);

  const optionsKey = useMemo(() => {
    return scriptSelectList.reduce((acc, key) => {
      acc[key] = options;
      if (key === 'minForBroadcasting') {
        acc[key] =
          values.totalSigners === null
            ? []
            : options.filter(({ value }) => value <= values.totalSigners);
      }
      return acc;
    }, {});
  }, [values]);

  const handleSetValue = useCallback(
    (value) => {
      const { totalSigners: total, minForBroadcasting: min } = value;
      if (values.totalSigners !== total) {
        switch (true) {
          case Number(min || 0) >= total:
            value.minForBroadcasting = total;
            break;
          case !min:
            value.minForBroadcasting = options[0].value;
            break;
          default:
            value.minForBroadcasting = min;
        }
      }
      dispatch(multisignSetTokenScript(value));
    },
    [dispatch, values],
  );

  return (
    <div className="multisig-create__signatures__container">
      {scriptSelectList &&
        scriptSelectList.map((k) => (
          <div className="multisig-create__signatures" key={k}>
            {!disabledKeys[k] && (
              <>
                <p>{t(titles[k])}</p>
                <Select
                  onChange={({ value: v }) =>
                    handleSetValue({ ...values, [k]: v })
                  }
                  options={optionsKey[k]}
                  value={values[k]}
                />
              </>
            )}
          </div>
        ))}
    </div>
  );
};
