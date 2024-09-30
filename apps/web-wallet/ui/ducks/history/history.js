import { createSlice } from '@reduxjs/toolkit';

import {
  ASSET_ROUTE,
  DEFAULT_ROUTE,
  SWAPS_ROUTE,
} from '../../helpers/constants/routes';
import { getTransactions } from '../../store/actions';

// Constants

const initialState = {
  mostRecentOverviewPage: DEFAULT_ROUTE,
  redirectOverviewPage: '',
};

const name = 'history';

// Slice (reducer plus auto-generated actions and action creators)

const slice = createSlice({
  name,
  initialState,
  reducers: {
    pageChanged: (state, action) => {
      const path = action.payload;
      if (
        path === DEFAULT_ROUTE ||
        path.startsWith(ASSET_ROUTE) ||
        path.startsWith(SWAPS_ROUTE)
      ) {
        state.mostRecentOverviewPage = path;
      }
    },
    setRedirectOverviewPage: (state, { payload }) => {
      state.redirectOverviewPage = payload;
    },
    resetRedirectOverviewPage: (state) => {
      state.redirectOverviewPage = initialState.redirectOverviewPage;
    },
  },
});

const { actions, reducer } = slice;

export default reducer;

// Selectors

export const getMostRecentOverviewPage = (state) =>
  state[name].redirectOverviewPage || state[name].mostRecentOverviewPage;

// Actions / action-creators
export const { pageChanged } = actions;

export function setRedirectOverviewPage(path = '') {
  return async (dispatch) => {
    return dispatch(actions.setRedirectOverviewPage(path));
  };
}
