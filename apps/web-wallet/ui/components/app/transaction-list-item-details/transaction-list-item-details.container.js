import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { tryReverseResolveAddress } from '../../../store/actions';
import {
  getAddressBook,
  getIsCustomNetwork,
  getRpcPrefsForCurrentProvider,
  getEnsResolutionByAddress,
  getAccountName,
  getMetadataContractName,
  getMetaMaskIdentities,
  assetModel,
} from '../../../selectors';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';
import TransactionListItemDetails from './transaction-list-item-details.component';
import { TransactionType } from '../../../../shared/constants/transaction';

const mapStateToProps = (state, ownProps) => {
  const {
    recipientAddress,
    senderAddress,
    transactionGroup: { primaryTransaction },
  } = ownProps;
  let recipientEns;
  if (recipientAddress) {
    const address = toChecksumHexAddress(recipientAddress);
    recipientEns = getEnsResolutionByAddress(state, address);
  }
  const addressBook = getAddressBook(state);
  const identities = getMetaMaskIdentities(state);
  const recipientName = getAccountName(identities, recipientAddress);
  const recipientMetadataName = getMetadataContractName(
    state,
    recipientAddress,
  );

  const getNickName = (address) => {
    const entry = addressBook.find((contact) => {
      return address.toLowerCase() === contact.address.toLowerCase();
    });
    return (entry && entry.name) || '';
  };
  const rpcPrefs = getRpcPrefsForCurrentProvider(state);

  const isCustomNetwork = getIsCustomNetwork(state);

  let sendAsset = primaryTransaction.txParams?.localId;
  if (primaryTransaction.type === TransactionType.swap) {
    sendAsset = primaryTransaction.source;
  }

  return {
    rpcPrefs,
    recipientEns,
    senderNickname: senderAddress && getNickName(senderAddress),
    recipientNickname: recipientAddress ? getNickName(recipientAddress) : null,
    isCustomNetwork,
    blockExplorerLinkText: {
      firstPart: 'viewinExplorer',
      secondPart: 'blockExplorerAccountAction',
    },
    recipientName,
    recipientMetadataName,
    sendAsset: assetModel(state, sendAsset),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tryReverseResolveAddress: (address) => {
      return dispatch(tryReverseResolveAddress(address));
    },
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(TransactionListItemDetails);
