import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Popover from '../../../ui/popover';
import { ICON_NAMES, Icon, Text } from '../../../component-library';
import Box from '../../../ui/box/box';
import {
  AlignItems,
  DISPLAY,
  Size,
} from '../../../../helpers/constants/design-system';
import Button from '../../../ui/button';
import { getMyPaymentMethods } from '../../../../selectors';
import PaymentMethodForm from '../../p2p/bank-account-form';
import { removePaymentMethod } from '../../../../store/actions';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import {
  getStrPaymentMethodInstance,
  humanizePaymentMethodName,
} from '../../../../../shared/lib/payment-methods-utils';

export default function BankAccountPicker({
  value = null,
  currency,
  onSelect,
  onClose,
}) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [createMode, setCreateMode] = useState(false);

  const bankAccounts = useSelector(getMyPaymentMethods);
  const toggleCreateMode = () => {
    setCreateMode(!createMode);
  };

  const onCreated = () => {
    toggleCreateMode();
  };

  const remove = (val) => {
    dispatch(removePaymentMethod(val));
  };

  const onChangeHandler = (e) => {
    const bankAccount = bankAccounts.find(
      ({ userPaymentMethodId }) =>
        userPaymentMethodId === Number(e.target.value),
    );
    onSelect(bankAccount);
    onClose();
  };
  return (
    <Popover
      className="bank-account-picker"
      title={t('bankAccountPickerTitle')}
      subtitle={createMode ? t('addNew') : t('selectBankAccount')}
      onBack={createMode && toggleCreateMode}
      onClose={onClose}
    >
      {createMode ? (
        <Box paddingLeft={4} paddingRight={4} paddingBottom={4}>
          <PaymentMethodForm currency={currency} onCreated={onCreated} />
        </Box>
      ) : (
        <>
          <FormControl>
            <RadioGroup
              value={value?.userPaymentMethodId}
              onChange={onChangeHandler}
            >
              {bankAccounts.map((bankAccount) => (
                <Box
                  key={bankAccount.userPaymentMethodId}
                  display={DISPLAY.FLEX}
                  className="bank-account-picker__option"
                >
                  <FormControlLabel
                    className="flex-grow"
                    value={bankAccount.userPaymentMethodId}
                    control={<Radio color="primary" />}
                    label={
                      <Box>
                        <Text>
                          {humanizePaymentMethodName(
                            bankAccount.paymentMethod.name,
                            t,
                          )}
                        </Text>
                        <Text>{getStrPaymentMethodInstance(bankAccount)}</Text>
                      </Box>
                    }
                  />
                  {value !== bankAccount && (
                    <Button
                      type="link"
                      large
                      onClick={() => remove(bankAccount.userPaymentMethodId)}
                    >
                      <Icon name={ICON_NAMES.TRASH_DEX} size={Size.LG} />
                    </Button>
                  )}
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
          <Button
            className="bank-account-picker__add-new"
            type="link"
            onClick={toggleCreateMode}
          >
            <Box
              display={DISPLAY.FLEX}
              alignItems={AlignItems.center}
              padding={3}
            >
              <Icon name={ICON_NAMES.ADD} />
              <Text paddingLeft={3}>{t('addNew')}</Text>
            </Box>
          </Button>
        </>
      )}
    </Popover>
  );
}

BankAccountPicker.propTypes = {
  value: PropTypes.object,
  currency: PropTypes.string,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};
