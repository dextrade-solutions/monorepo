import PropTypes from 'prop-types';

export const providerType = PropTypes.shape({
  chainId: PropTypes.string.isRequired,
  contract: PropTypes.string,
});

export const multisigPropTypes = PropTypes.shape({
  id: PropTypes.string.isRequired,
  account: PropTypes.string.isRequired,
  initiatorAddress: PropTypes.string.isRequired,
  totalSigners: PropTypes.number.isRequired,
  minForBroadcasting: PropTypes.number.isRequired,
  provider: providerType,
  pubkeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  cdt: PropTypes.string,
});
