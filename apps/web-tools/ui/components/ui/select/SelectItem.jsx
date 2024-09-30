import { MenuItem } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

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
