import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Identicon from '../../../ui/identicon';
import { ellipsify } from '../../../../pages/send/send.utils';

function addressesEqual(address1, address2) {
  return String(address1).toLowerCase() === String(address2).toLowerCase();
}

export default function RecipientGroup({
  label,
  items,
  onSelect,
  selectedAddress,
}) {
  if (!items || !items.length) {
    return null;
  }

  return (
    <div
      className="send__select-recipient-wrapper__group"
      data-testid="recipient-group"
    >
      {label && (
        <div className="send__select-recipient-wrapper__group-label">
          {label}
        </div>
      )}
      {items.map(({ address, identity = {} }) => (
        <div
          key={address}
          onClick={() => onSelect(address, identity.name)}
          className={classnames({
            'send__select-recipient-wrapper__group-item': !addressesEqual(
              address,
              selectedAddress,
            ),
            'send__select-recipient-wrapper__group-item--selected':
              addressesEqual(address, selectedAddress),
          })}
        >
          <Identicon address={address} diameter={28} />
          <div
            className="send__select-recipient-wrapper__group-item__content"
            data-testid="recipient"
          >
            <div className="send__select-recipient-wrapper__group-item__title">
              {identity.name || ellipsify(address)}
            </div>
            {identity.name && (
              <div className="send__select-recipient-wrapper__group-item__subtitle">
                {ellipsify(address)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

RecipientGroup.propTypes = {
  label: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      walletAddress: PropTypes.string.isRequired,
      name: PropTypes.string,
    }),
  ),
  onSelect: PropTypes.func.isRequired,
  selectedAddress: PropTypes.string,
};
