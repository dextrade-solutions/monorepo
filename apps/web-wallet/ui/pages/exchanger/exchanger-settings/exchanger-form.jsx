import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormField from '../../../components/ui/form-field';
import {
  dextradeRequest,
  exchangerUpdate,
  p2pExchangesExchangerCreate,
} from '../../../store/actions';
import { EXCHANGER_ROUTE } from '../../../helpers/constants/routes';
import Box from '../../../components/ui/box';
import PageContainer from '../../../components/ui/page-container';
import FileField from '../../../components/ui/file-field/file-field';
import {
  AlignItems,
  DISPLAY,
  TextVariant,
} from '../../../helpers/constants/design-system';
import DextradeSessions from '../../../components/app/dextrade-sessions';
import { FormTextField, Text } from '../../../components/component-library';
import { getExchanger } from '../../../selectors';
import { useDebouncedEffect } from '../../../../shared/lib/use-debounced-effect';

export default function ExchangerForm({ wrapPageContainer }) {
  const exchanger = useSelector(getExchanger);
  const dispatch = useDispatch();
  const history = useHistory();
  const [exchangerName, setExchangerName] = useState(exchanger.name);
  const [loading, setLoading] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  const helperText = loading && 'Saving...';

  const submitBtnLabel = helperText || 'Save';

  const save = async () => {
    setLoading(true);
    try {
      await dispatch(
        p2pExchangesExchangerCreate({
          name: exchangerName,
        }),
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (base64string) => {
    setLoadingAvatar(true);
    dispatch(
      dextradeRequest({
        method: 'POST',
        url: 'api/user/save/avatar',
        data: {
          // remove base64 prefix from string, before save
          avatar: base64string.split(',').pop(),
        },
      }),
    )
      .then(() => {
        dispatch(exchangerUpdate());
      })
      .finally(() => {
        setLoadingAvatar(false);
      });
  };

  const renderPageContainer = (v) => {
    return (
      <PageContainer
        className="exchanger-settings"
        title="Exchanger Settings"
        subtitle="Configure the Exchanger"
        disabled={loading}
        hideFooter={false}
        onSubmit={() => save()}
        submitText={submitBtnLabel}
        onCancel={() => {
          history.push(EXCHANGER_ROUTE);
        }}
        onClose={() => {
          history.push(EXCHANGER_ROUTE);
        }}
        contentComponent={<Box padding={4}>{v}</Box>}
      />
    );
  };

  const formWrap = wrapPageContainer ? (v) => renderPageContainer(v) : (v) => v;

  useDebouncedEffect(
    () => {
      if (exchangerName !== exchanger.name) {
        save();
      }
    },
    [exchangerName],
    500,
  );

  return formWrap(
    <>
      <Text variant={TextVariant.headingSm} marginBottom={2}>
        Exchanger settings
      </Text>
      <FileField
        onChange={uploadAvatar}
        base64
        dextradeAvatarHash={exchanger.avatar}
        loading={loadingAvatar}
        avatar
        label="Avatar"
        boxProps={{
          display: DISPLAY.FLEX,
          alignItems: AlignItems.center,
          marginTop: 3,
          marginBottom: 3,
        }}
      />
      <FormTextField
        autoFocus
        helpText={helperText}
        error=""
        onChange={(e) => {
          setExchangerName(e.target.value);
        }}
        label="Name"
        value={exchangerName}
      />
      <DextradeSessions />
    </>,
  );
}

ExchangerForm.propTypes = {
  exchanger: PropTypes.object,
  wrapPageContainer: PropTypes.bool,
};
