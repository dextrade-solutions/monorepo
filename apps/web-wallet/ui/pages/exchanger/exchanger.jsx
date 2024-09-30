import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Box from '../../components/ui/box/box';
import {
  EXCHANGER_CREATE_ROUTE,
  EXCHANGER_RESERVES_ROUTE,
  EXCHANGER_ROUTE,
  EXCHANGER_FOR_APPROVAL,
  EXCHANGER_SETTINGS_ROUTE,
  EXCHANGER_AD_EDIT_ROUTE,
} from '../../helpers/constants/routes';

import ExchangerView from './exchanger-view';
import ExchangerCreate from './exchanger-create';
import ExchangerReserves from './exchanger-reserves';
import ExchangerExchange from './exchanger-exchange';
import ExchangerSettings from './exchanger-settings';
import ExcahngerForApproval from './exchanger-for-approval';

export default function ExchangerPage() {
  return (
    <Box className="exchanger">
      <Switch>
        <Route exact path={EXCHANGER_ROUTE} component={ExchangerView} />
        <Route
          exact
          path={EXCHANGER_CREATE_ROUTE}
          component={ExchangerCreate}
        />
        <Route
          exact
          path={EXCHANGER_RESERVES_ROUTE}
          component={ExchangerReserves}
        />
        <Route
          exact
          path={`${EXCHANGER_AD_EDIT_ROUTE}/:id?`}
          component={ExchangerExchange}
        />
        <Route
          exact
          path={EXCHANGER_FOR_APPROVAL}
          component={ExcahngerForApproval}
        />
      </Switch>
    </Box>
  );
}
