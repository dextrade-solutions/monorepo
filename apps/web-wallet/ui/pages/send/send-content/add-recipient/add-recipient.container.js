import { connect } from 'react-redux';
import {
  getAddressBook,
  getAddressBookEntry,
  getMetaMaskWalletAccountsByCurrentProvider,
  currentNetworkTxListSelector,
} from '../../../../selectors';

import {
  updateRecipient,
  updateRecipientUserInput,
  useMyAccountsForRecipientSearch,
  useContactListForRecipientSearch,
  getIsUsingMyAccountForRecipientSearch,
  getRecipientUserInput,
  getRecipient,
  addHistoryEntry,
} from '../../../../ducks/send';
import {
  getDomainResolution,
  getDomainError,
  getDomainWarning,
} from '../../../../ducks/domains';
import AddRecipient from './add-recipient.component';

export default connect(mapStateToProps, mapDispatchToProps)(AddRecipient);

function mapStateToProps(state) {
  const domainResolution = getDomainResolution(state);
  let addressBookEntryName = '';
  if (domainResolution) {
    const addressBookEntry = getAddressBookEntry(state, domainResolution) || {};
    addressBookEntryName = addressBookEntry.name;
  }

  const addressBook = getAddressBook(state);

  const txList = [...currentNetworkTxListSelector(state)].reverse();

  const nonContacts = addressBook
    .filter(({ name }) => !name)
    .map((nonContact) => {
      const nonContactTx = txList.find(
        (transaction) =>
          transaction.txParams?.to === nonContact.address.toLowerCase(),
      );
      return { ...nonContact, timestamp: nonContactTx?.time };
    });

  nonContacts.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  const ownedAccounts = getMetaMaskWalletAccountsByCurrentProvider(state);
  // const draftTransaction = getCurrentDraftTransaction(state);

  return {
    addressBook,
    addressBookEntryName,
    contacts: addressBook.filter(({ name }) => Boolean(name)),
    domainResolution,
    domainError: getDomainError(state),
    domainWarning: getDomainWarning(state),
    nonContacts,
    ownedAccounts,
    isUsingMyAccountsForRecipientSearch:
      getIsUsingMyAccountForRecipientSearch(state),
    userInput: getRecipientUserInput(state),
    recipient: getRecipient(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addHistoryEntry: (entry) => dispatch(addHistoryEntry(entry)),
    updateRecipient: ({ address, nickname }) =>
      dispatch(updateRecipient({ address, nickname })),
    updateRecipientUserInput: (newInput) =>
      dispatch(updateRecipientUserInput(newInput)),
    useMyAccountsForRecipientSearch: () =>
      dispatch(useMyAccountsForRecipientSearch()),
    useContactListForRecipientSearch: () =>
      dispatch(useContactListForRecipientSearch()),
  };
}
