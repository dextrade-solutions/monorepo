import { SubjectType } from '@metamask/subject-metadata-controller';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  getAccountsWithLabels,
  getLastConnectedInfo,
  getPermissionsRequests,
  getSelectedAddress,
  getTargetSubjectMetadata,
} from '../../selectors';
import { formatDate, getURLHostName } from '../../helpers/utils/util';
import {
  approvePermissionsRequest,
  rejectPermissionsRequest,
  showModal,
  getRequestAccountTabIds,
  resolvePendingApproval,
  rejectPendingApproval,
} from '../../store/actions';
import {
  CONNECT_ROUTE,
  CONNECT_CONFIRM_PERMISSIONS_ROUTE,
} from '../../helpers/constants/routes';
import PermissionApproval from './permissions-connect.component';

const mapStateToProps = (state, ownProps) => {
  const {
    match: {
      params: { id: permissionsRequestId },
    },
    location: { pathname },
  } = ownProps;
  const permissionsRequests = getPermissionsRequests(state);
  const currentAddress = getSelectedAddress(state);

  const permissionsRequest = permissionsRequests.find(
    (req) => req.metadata.id === permissionsRequestId,
  );

  const {
    metadata = {
      requiredChainIds: [],
    },
  } = permissionsRequest || {};
  const { origin, requiredChainIds } = metadata;

  const targetSubjectMetadata = getTargetSubjectMetadata(state, origin) ?? {
    name: getURLHostName(origin) || origin,
    origin,
    iconUrl: null,
    extensionId: null,
    subjectType: SubjectType.Unknown,
  };

  const accountsWithLabels = getAccountsWithLabels(state, requiredChainIds);

  const isRequestingAccounts =
    Boolean(accountsWithLabels.length) &&
    Boolean(permissionsRequest?.permissions?.eth_accounts);

  const lastConnectedInfo = getLastConnectedInfo(state) || {};
  const addressLastConnectedMap = lastConnectedInfo[origin]?.accounts || {};

  Object.keys(addressLastConnectedMap).forEach((key) => {
    addressLastConnectedMap[key] = formatDate(
      addressLastConnectedMap[key],
      'yyyy-MM-dd',
    );
  });

  const connectPath = `${CONNECT_ROUTE}/${permissionsRequestId}`;
  const confirmPermissionPath = `${CONNECT_ROUTE}/${permissionsRequestId}${CONNECT_CONFIRM_PERMISSIONS_ROUTE}`;

  let totalPages = 1 + isRequestingAccounts;
  totalPages = totalPages.toString();

  let page = '';
  if (pathname === connectPath) {
    page = '1';
  } else if (pathname === confirmPermissionPath) {
    page = isRequestingAccounts ? '2' : '1';
  } else {
    throw new Error('Incorrect path for permissions-connect component');
  }

  return {
    isRequestingAccounts,
    permissionsRequest,
    permissionsRequestId,
    accounts: accountsWithLabels,
    currentAddress,
    origin,
    newAccountNumber: accountsWithLabels.length + 1,
    addressLastConnectedMap,
    lastConnectedInfo,
    connectPath,
    confirmPermissionPath,
    totalPages,
    page,
    targetSubjectMetadata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    approvePermissionsRequest: (request) =>
      dispatch(approvePermissionsRequest(request)),
    rejectPermissionsRequest: (requestId) =>
      dispatch(rejectPermissionsRequest(requestId)),
    approvePendingApproval: (id, value, options) =>
      dispatch(resolvePendingApproval(id, value, options)),
    rejectPendingApproval: (id, error) =>
      dispatch(rejectPendingApproval(id, error)),
    showNewAccountModal: ({ onCreateNewAccount, newAccountNumber }) => {
      return dispatch(
        showModal({
          name: 'NEW_ACCOUNT',
          onCreateNewAccount,
          newAccountNumber,
        }),
      );
    },
    getRequestAccountTabIds: () => dispatch(getRequestAccountTabIds()),
  };
};

const PermissionApprovalContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PermissionApproval);

PermissionApprovalContainer.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default PermissionApprovalContainer;
