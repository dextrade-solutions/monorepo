import React from 'react';
import { MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

const SelectItem = ({ children, ...rest }) => {
  return (
    <MenuItem className="select__item" {...rest}>
      {children}
    </MenuItem>
  );
};

SelectItem.propTypes = {
  children: PropTypes.node,
};

export default SelectItem;
