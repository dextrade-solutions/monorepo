import { Route, Routes } from 'react-router-dom';

import Auth from './auth';
import Home from './home';
import { AUTH_ROUTE, HOME_ROUTE } from '../helpers/constants/routes';

export default function RoutesRoot() {
  return (
    <>
      <Routes>
        <Route path={HOME_ROUTE} element={<Home />} />
        <Route path={AUTH_ROUTE} element={<Auth />} />
      </Routes>
    </>
  );
}
