import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Box from '../../components/ui/box';

import {
  CONNECT_HARDWARE_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  IMPORT_WALLET_ROUTE,
  NEW_ACCOUNT_ROUTE,
} from '../../helpers/constants/routes';
import ConnectHardwareForm from './connect-hardware';
import NewAccountImportForm from './import-account';
import ImportWallet from './import-wallet';
import NewAccountCreateForm from './new-account.container';

export default function CreateAccountPage() {
  return (
    <Box className="new-account">
      <Switch>
        <Route
          exact
          path={NEW_ACCOUNT_ROUTE}
          component={NewAccountCreateForm}
        />
        <Route
          exact
          path={IMPORT_ACCOUNT_ROUTE}
          component={NewAccountImportForm}
        />
        <Route
          exact
          path={CONNECT_HARDWARE_ROUTE}
          component={ConnectHardwareForm}
        />
        <Route exact path={IMPORT_WALLET_ROUTE} component={ImportWallet} />
      </Switch>
    </Box>
  );
}
