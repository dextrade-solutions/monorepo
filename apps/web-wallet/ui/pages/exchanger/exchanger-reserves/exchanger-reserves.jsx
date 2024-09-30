import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { uuid4 } from '@sentry/utils';
import { isEqual } from 'lodash';
import { useI18nContext } from '../../../hooks/useI18nContext';
import PageContainer from '../../../components/ui/page-container';
import {
  EXCHANGER_AD_EDIT_ROUTE,
  EXCHANGER_ROUTE,
} from '../../../helpers/constants/routes';
import Box from '../../../components/ui/box/box';
import AssetInputCard from '../../../components/ui/asset-input-card';

import { p2pCommitReserves } from '../../../store/actions';
import { DISPLAY } from '../../../helpers/constants/design-system';
import { getExchangerReserves } from '../../../selectors';
import { Button } from '../../../components/component-library';

export default function ExchangerReserves() {
  const t = useI18nContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const pageContainerRef = useRef();

  const allReserves = useSelector(getExchangerReserves, isEqual).filter(
    ({ asset }) => asset.isFiat,
  );
  const [reserves, setReserves] = useState(allReserves);
  const [submitText, setSubmitText] = useState(t('save'));
  const [disabledSave, setDisabledSave] = useState(false);

  async function save() {
    setDisabledSave(true);
    setSubmitText(t('saving'));

    const result = {
      data: null,
      error: null,
    };

    try {
      result.data = await dispatch(
        p2pCommitReserves(
          reserves.map((reserve) => ({
            ...reserve,
            asset: reserve.asset.getToken(),
          })),
        ),
      );
      setSubmitText(t('saved'));
    } catch (e) {
      setSubmitText(t('error'));
      result.error = e;
    }
    setDisabledSave(false);

    setTimeout(() => {
      setSubmitText(t('save'));
    }, 3000);
    return result;
  }

  function updateReservesItem(id, val) {
    setReserves(reserves.map((r) => (r.id === id ? { ...r, ...val } : r)));
  }

  return (
    <>
      <PageContainer
        ref={pageContainerRef}
        title="Fiat reserves"
        subtitle={t('liquidityPoolSubtitle')}
        disabled={disabledSave}
        hideFooter={!reserves.length}
        onSubmit={async () => {
          const result = await save();
          if (!result.error) {
            history.push(EXCHANGER_AD_EDIT_ROUTE);
          }
        }}
        submitText={submitText}
        onCancel={() => {
          history.push(EXCHANGER_ROUTE);
        }}
        onClose={() => {
          history.push(EXCHANGER_ROUTE);
        }}
        subtitleContent={
          <>
            <Box display={DISPLAY.FLEX}>
              <span className="flex-grow">
                {t('saved')} {allReserves.length}/{reserves.length}
              </span>

              <Button
                type="link"
                className="exchanger-settings__add-btn"
                onClick={() => {
                  setReserves([
                    ...reserves,
                    {
                      id: uuid4(),
                      asset: null,
                    },
                  ]);
                  pageContainerRef.current.scrollToBottom();
                }}
              >
                {t('add')}
              </Button>
            </Box>
          </>
        }
        contentComponent={
          <Box margin={4}>
            {!reserves.length && <span>Reserves not added...</span>}
            {reserves.map((reserve, idx) => (
              <Box key={idx} marginBottom={4}>
                <AssetInputCard
                  asset={reserve.asset}
                  hidePaymentMethods
                  value={reserve}
                  onChange={(val) => {
                    updateReservesItem(reserve.id, val);
                  }}
                />
              </Box>
            ))}
          </Box>
        }
      />
    </>
  );
}
