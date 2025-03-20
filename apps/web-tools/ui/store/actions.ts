import * as actionConstants from './actionConstants';
import { AppDispatch } from './store';
import { fetchLocale } from '../helpers/utils/i18n-helper';

export function updateCurrentLocale(key: string) {
  return async (dispatch: AppDispatch) => {
    const messages = await fetchLocale(key);
    dispatch(setCurrentLocale(key, messages));
  };
}

export function setCurrentLocale(
  locale: string,
  messages: Record<string, string>,
) {
  window.localStorage.setItem('lang', locale);
  return {
    type: actionConstants.SET_CURRENT_LOCALE,
    payload: {
      locale,
      messages,
    },
  };
}
