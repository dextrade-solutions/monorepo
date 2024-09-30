import React, { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';

const ErrorRedirect = ({ error = null }) => {
  const history = useHistory();
  // TODO: implement error notification and redirect to home screen

  // useEffect(() => {
  //   history.push(DEFAULT_ROUTE);
  //   console.error('Unexpected error! Redirect to home page', error);
  //   console.log('reload window');
  //   window.reload();
  // }, [history, error]);
  //
  // useEffect(() => {
  //   window.reload();
  // }, []);

  return <div>{Boolean(error) && error}</div>;
};

export default memo(ErrorRedirect);
