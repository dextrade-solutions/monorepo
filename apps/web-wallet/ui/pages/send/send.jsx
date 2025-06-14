import React, { useEffect, useCallback, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  addHistoryEntry,
  getDraftTransactionExists,
  getIsUsingMyAccountForRecipientSearch,
  getRecipient,
  getRecipientUserInput,
  getSendStage,
  getSendAsset,
  resetRecipientInput,
  resetSendState,
  SEND_STAGES,
  startNewDraftTransaction,
  updateRecipient,
  updateRecipientUserInput,
} from '../../ducks/send';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import { isCustomPriceExcessive } from '../../selectors';
import { getSendHexDataFeatureFlagState } from '../../ducks/metamask/metamask';
import { showQrScanner } from '../../store/actions';
import { MetaMetricsContext } from '../../contexts/metametrics';
import { EVENT } from '../../../shared/constants/metametrics';

import SendHeader from './send-header';
import AddRecipient from './send-content/add-recipient';
import SendContent from './send-content';
import SendFooter from './send-footer';
import DomainInput from './send-content/add-recipient/domain-input';
import { useAsset } from '../../hooks/useAsset';

const sendSliceIsCustomPriceExcessive = (state) =>
  isCustomPriceExcessive(state, true);

export default function SendTransactionScreen({ onSubmit, submitText }) {
  const history = useHistory();
  const startedNewDraftTransaction = useRef(false);
  const stage = useSelector(getSendStage);
  const gasIsExcessive = useSelector(sendSliceIsCustomPriceExcessive);
  const isUsingMyAccountsForRecipientSearch = useSelector(
    getIsUsingMyAccountForRecipientSearch,
  );
  const recipient = useSelector(getRecipient);
  const showHexData = useSelector(getSendHexDataFeatureFlagState);
  const userInput = useSelector(getRecipientUserInput);
  const draftTransactionExists = useSelector(getDraftTransactionExists);
  const location = useLocation();
  const trackEvent = useContext(MetaMetricsContext);
  const asset = useSelector(getSendAsset);
  const sendAsset = useAsset(asset);
  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const dispatch = useDispatch();

  const cleanup = useCallback(() => {
    dispatch(resetSendState());
  }, [dispatch]);

  /**
   * It is possible to route to this page directly, either by typing in the url
   * or by clicking the browser back button after progressing to the confirm
   * screen. In the case where a draft transaction does not yet exist, this
   * hook is responsible for creating it. We will assume that this is a native
   * asset send.
   *
   * UPD_DEXTRADE: not possible
   */
  // useEffect(() => {
  //   if (
  //     draftTransactionExists === false &&
  //     startedNewDraftTransaction.current === false
  //   ) {
  //     startedNewDraftTransaction.current = true;
  //     dispatch(startNewDraftTransaction({ type: AssetType.native }));
  //   }
  // }, [draftTransactionExists, dispatch]);

  useEffect(() => {
    window.addEventListener('beforeunload', cleanup);
  }, [cleanup]);

  useEffect(() => {
    if (location.search === '?scan=true') {
      dispatch(showQrScanner());

      // Clear the queryString param after showing the modal
      const cleanUrl = window.location.href.split('?')[0];
      window.history.pushState({}, null, `${cleanUrl}`);
      window.location.hash = '#send';
    }
  }, [location, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSendState());
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [dispatch, cleanup]);

  if (!sendAsset) {
    history.push(mostRecentOverviewPage);
    return null;
  }

  let content;

  if (
    draftTransactionExists &&
    [SEND_STAGES.EDIT, SEND_STAGES.DRAFT].includes(stage)
  ) {
    content = (
      <>
        <SendContent
          showHexData={showHexData}
          gasIsExcessive={gasIsExcessive}
        />
        <SendFooter
          key="send-footer"
          history={history}
          onSubmit={onSubmit}
          submitText={submitText}
        />
      </>
    );
  } else {
    content = <AddRecipient />;
  }

  return (
    <div className="page-container">
      <SendHeader history={history} />
      <DomainInput
        sendAsset={sendAsset}
        userInput={userInput}
        className="send__to-row"
        onChange={(address) => dispatch(updateRecipientUserInput(address))}
        onValidAddressTyped={async (address) => {
          dispatch(
            addHistoryEntry(`sendFlow - Valid address typed ${address}`),
          );
          await dispatch(updateRecipientUserInput(address));
          dispatch(updateRecipient({ address, nickname: '' }));
        }}
        internalSearch={isUsingMyAccountsForRecipientSearch}
        selectedAddress={recipient.address}
        selectedName={recipient.nickname}
        onPaste={(text) => {
          dispatch(
            addHistoryEntry(
              `sendFlow - User pasted ${text} into address field`,
            ),
          );
        }}
        onReset={() => dispatch(resetRecipientInput())}
        scanQrCode={() => {
          trackEvent({
            event: 'Used QR scanner',
            category: EVENT.CATEGORIES.TRANSACTIONS,
            properties: {
              action: 'Edit Screen',
              legacy_event: true,
            },
          });
          dispatch(showQrScanner());
        }}
      />
      {content}
    </div>
  );
}
