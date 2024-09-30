import { RootState } from '../store/store';

export function getUseCurrencyRateCheck(state: RootState) {
  return Boolean(state.useCurrencyRateCheck);
}
