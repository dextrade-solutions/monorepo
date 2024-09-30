import React from 'react';
import PropTypes from 'prop-types';
import UrlIcon from '../../ui/url-icon/url-icon';
import { getCoinIconByUid } from '../../../../shared/constants/tokens';

export default function TransactionIconP2P({ uid1, uid2 }) {
  const coin1url = getCoinIconByUid(uid1);
  const coin2url = getCoinIconByUid(uid2);

  return (
    <div className="transaction-icon-p2p">
      <UrlIcon className="transaction-icon-p2p__coin1" url={coin1url} />
      <UrlIcon className="transaction-icon-p2p__coin2" url={coin2url} />
    </div>
  );
}

TransactionIconP2P.propTypes = {
  uid1: PropTypes.string,
  uid2: PropTypes.string,
};
