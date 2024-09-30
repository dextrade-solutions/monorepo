import {
  defaultAddressState,
  defaultControllerData,
  defaultCreatorData,
} from '../../app/scripts/controllers/multisigner/constants';
import { getSelectedAddress } from './selectors';

const cdtSort = (a, b) => new Date(b.cdt).getTime() - new Date(a.cdt).getTime();

//
export const getMultisigner = ({ metamask }) => metamask.multisigner || {};

export const getSelectedMultisigner = (state) => {
  const selectedAddress = getSelectedAddress(state);
  const multisigner = getMultisigner(state);
  return multisigner[selectedAddress] || defaultAddressState;
};

export const getMultisginerCreator = (state) => {
  const multisigner = getSelectedMultisigner(state);
  return multisigner?.creator || defaultCreatorData;
};

export const getMultisginerLoading = (state) => {
  const multisigner = getSelectedMultisigner(state);
  return Boolean(multisigner?.isLoading);
};

export const getMultisginerState = (state) => {
  const multisigner = getSelectedMultisigner(state);
  return multisigner?.state || {};
};

//
export const getMultisignerByLocalId = (state, localId) => {
  const multisigner = getMultisginerState(state);
  return multisigner[localId] || defaultControllerData;
};

export const getAllMultisignsList = (state) => {
  const selectedState = getMultisginerState(state);
  return Object.entries(selectedState).reduce((acc, [_, v]) => {
    if (!v.multisigs || !v.multisigs.size) {
      return acc;
    }
    const mss = [...v.multisigs].map(([_, ms]) => ms);
    acc = [...acc, ...mss];
    return acc;
  }, []);
};

export const getSortedAllMultisignsList = (state) => {
  return getAllMultisignsList(state).sort(cdtSort);
};

export const getMultisigById = (id) => {
  return (state) => {
    if (!state) {
      return null;
    }
    const selectedState = getMultisginerState(state);
    return Object.entries(selectedState).reduce((acc, [_, v]) => {
      const map = v?.multisigs || new Map();
      if (!map.size || !map.has(id)) {
        return acc;
      }
      acc = map.get(id);
      return acc;
    }, {});
  };
};

export const getMultisigTransactions = (state) => {
  const selectedState = getMultisginerState(state);
  return Object.entries(selectedState).reduce((acc, [_, v]) => {
    const map = v?.transactions || new Map();
    if (!map.size) {
      return acc;
    }
    const txs = [...map].map(([_, tx]) => tx);
    acc = [...acc, ...txs];
    return acc;
  }, []);
};

export const getMultisigTransactionsByAccount = (addressId) => {
  return (state) => {
    if (!state || !addressId) {
      return [];
    }
    return getMultisigTransactions(state)
      .filter((tx) => tx.addressId === addressId)
      .sort(cdtSort);
  };
};

//
export const getCreatorMultisigns = (state) => {
  const { token } = getMultisginerCreator(state);
  if (!token) {
    return getAllMultisignsList(state).sort(cdtSort);
  }
  const { multisigs } = getMultisignerByLocalId(state, token.localId);
  const selectedAddress = getSelectedAddress(state);
  return [...multisigs]
    .map(([_, ms]) => ms)
    .filter(({ initiatorAddress }) =>
      initiatorAddress ? initiatorAddress === selectedAddress : true,
    )
    .sort(cdtSort);
};
