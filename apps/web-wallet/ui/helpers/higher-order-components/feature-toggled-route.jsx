import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

export default function FeatureToggledRoute(props) {
  const { flag, redirectRoute, beforeRender, ...rest } = props;

  if (flag) {
    beforeRender && typeof beforeRender === 'function' && beforeRender(props);
    return <Route {...rest} />;
  }
  return <Redirect to={{ pathname: redirectRoute }} />;
}

FeatureToggledRoute.propTypes = {
  flag: PropTypes.bool.isRequired,
  redirectRoute: PropTypes.string.isRequired,
  beforeRender: PropTypes.func,
};
