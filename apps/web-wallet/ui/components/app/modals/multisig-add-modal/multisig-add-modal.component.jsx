import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Size } from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ButtonIcon, ICON_NAMES, TextField } from '../../../component-library';
import MultisigModalLayout from './multisig-modal-layout';

const InputActions = ({ onChange, value }) => {
  const t = useI18nContext();

  const handleClose = useCallback(
    (e) => {
      e.preventDefault();
      onChange && onChange('');
    },
    [onChange],
  );

  const handleInsert = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange && onChange(text);
      }
    },
    [onChange],
  );

  return (
    <div className="multisig-add-modal__actions">
      {!value && (
        <ButtonIcon
          iconName={ICON_NAMES.INSERT}
          size={Size.XS}
          onClick={handleInsert}
          ariaLabel="insert"
        />
      )}
      {Boolean(value) && (
        <ButtonIcon
          iconName={ICON_NAMES.CLOSE}
          size={Size.XS}
          onClick={handleClose}
          ariaLabel={t('clear')}
        />
      )}
    </div>
  );
};

const MultisigAddModalComponent = (props, context) => {
  const { hideModal, submit } = props;
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const handleSetValue = useCallback((v) => {
    setError('');
    setValue(v);
  }, []);

  const handleChange = useCallback(
    ({ target }) => {
      handleSetValue(target.value);
    },
    [handleSetValue],
  );

  const handleClearInput = useCallback(() => {
    setValue('');
    setError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    setDisabled(true);
    try {
      await submit(value);
      handleClearInput();
      hideModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setDisabled(false);
    }
  }, [submit, value, handleClearInput, hideModal]);

  return (
    <MultisigModalLayout
      title={context.t('multisignatureId')}
      textSubmit={context.t('multisignatureJoin')}
      onClose={hideModal}
      onSubmit={handleSubmit}
      disabledSubmit={!value}
    >
      <div className="multisig-add-modal">
        <TextField
          disabled={disabled}
          value={value}
          className="multisig-add-modal__field"
          onChange={handleChange}
          autoFocus
          endAccessory={
            <InputActions value={value} onChange={handleSetValue} />
          }
        />
        {Boolean(error) && <span>{error}</span>}
      </div>
    </MultisigModalLayout>
  );
};

MultisigAddModalComponent.contextTypes = {
  t: PropTypes.func,
};

MultisigAddModalComponent.propTypes = {
  hideModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

export default MultisigAddModalComponent;
