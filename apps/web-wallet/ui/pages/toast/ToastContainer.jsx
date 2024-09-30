import PropTypes from 'prop-types';
import React, { memo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ToastContainer as Toast, Slide } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import './index.scss';

if (typeof window !== 'undefined') {
  injectStyle();
}

const CLOSE_TIMEOUT = 2000;
const LIMIT = 3;
const POSITION = {
  TOP_CENTER: 'top-center',
};

const ToastContainer = ({ children }) => {
  return (
    <>
      <Toast
        transition={Slide}
        className="toast"
        position={POSITION.TOP_CENTER}
        autoClose={CLOSE_TIMEOUT}
        limit={LIMIT}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="light"
      />
      {children}
    </>
  );
};

ToastContainer.propTypes = {
  children: PropTypes.node,
};

export default memo(ToastContainer);
