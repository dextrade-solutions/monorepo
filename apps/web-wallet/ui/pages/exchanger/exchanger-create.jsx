import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import {
  ButtonPrimary,
  ButtonSecondary,
  FormTextField,
  ICON_NAMES,
} from '../../components/component-library';
import Box from '../../components/ui/box/box';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import { p2pExchangesExchangerCreate } from '../../store/actions';
import { AlignItems, DISPLAY } from '../../helpers/constants/design-system';
import { useI18nContext } from '../../hooks/useI18nContext';
import { EXCHANGER_ROUTE } from '../../helpers/constants/routes';
import { getExchanger } from '../../selectors';

export default function ExchangerCreate() {
  const dispatch = useDispatch();
  const history = useHistory();
  const t = useI18nContext();
  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const exchanger = useSelector(getExchanger);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    message: null,
  });
  const [values, setValues] = useState({
    name: '',
  });

  const handleOnChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await dispatch(
      p2pExchangesExchangerCreate({
        name: values.name,
      }),
    )
      .then((result) => {
        if (result.error) {
          setErrors(result.error);
        } else {
          history.push(EXCHANGER_ROUTE);
        }
      })
      .catch((err) => {
        setErrors({ message: err.message });
      });
    setLoading(false);
  };

  if (exchanger) {
    return <Redirect to={{ pathname: EXCHANGER_ROUTE }} />;
  }

  return (
    <>
      <Box
        as="form"
        onSubmit={handleOnSubmit}
        marginBottom={4}
        style={{ width: '100%', maxWidth: '420px', padding: '30px' }}
      >
        <FormTextField
          label="Name"
          marginBottom={4}
          placeholder="Enter name of your exchanger"
          required
          name="name"
          id="name"
          onChange={handleOnChange}
          value={values.name}
          error={errors.message}
          helpText={errors.message || 'Users will see your exechanger name'}
        />

        <Box display={DISPLAY.FLEX} alignItems={AlignItems.center} gap={1}>
          <ButtonSecondary
            className="flex-grow"
            icon={ICON_NAMES.CLOSE}
            onClick={() => {
              history.push(mostRecentOverviewPage);
            }}
          >
            {t('cancel')}
          </ButtonSecondary>
          <ButtonPrimary className="flex-grow" type="submit" loading={loading}>
            {t('create')}
          </ButtonPrimary>
        </Box>
      </Box>
    </>
  );
}
