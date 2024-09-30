import classnames from 'classnames';
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getMultisginerLoading } from '../../../selectors';
import { MultisigListItem } from './components/MultisigListItem';
import { MultisigEmptyList } from './components/MultisigEmptyList';
import { multisigPropTypes } from './types';

export const MultisignerList = ({ list }) => {
  const isLoading = useSelector(getMultisginerLoading);

  return (
    <div className={classnames('multisig-list', { empty: !list.length })}>
      <MultisigEmptyList list={list} isLoading={isLoading} />
      {Boolean(list.length) &&
        list.map((ms) => <MultisigListItem key={ms.id} multisig={ms} />)}
    </div>
  );
};

MultisignerList.propTypes = {
  list: PropTypes.arrayOf(multisigPropTypes),
};

export default memo(MultisignerList);
