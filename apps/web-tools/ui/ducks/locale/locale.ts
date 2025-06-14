import * as actionConstants from '../../store/actionConstants';

export default function reduceLocaleMessages(state = {}, { type, payload }) {
  switch (type) {
    case actionConstants.SET_CURRENT_LOCALE:
      return {
        ...state,
        current: payload.messages,
        currentLocale: payload.locale,
      };
    default:
      return state;
  }
}

export const getCurrentLocale = (state: any) =>
  state.localeMessages.currentLocale;

export const getCurrentLocaleMessages = (state: any) =>
  state.localeMessages.current;

export const getEnLocaleMessages = (state: any) => state.localeMessages.en;
