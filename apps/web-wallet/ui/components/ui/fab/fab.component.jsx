import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Fab as FabCore } from '@mui/material';

const Fab = ({ children, className, ...fabProps }) => {
  return (
    <FabCore className={classnames('fab', className)} {...fabProps}>
      {children}
    </FabCore>
  );
};

Fab.propTypes = {
  /**
   * Additional className to provide on the root element of the fab
   */
  className: PropTypes.string,
  /**
   * The children of the fab component
   */
  children: PropTypes.node,
};

export default Fab;
