import { useSelector } from 'react-redux';
import { getFiatList } from '../selectors';

export const useFiats = () => {
  const fiats = useSelector(getFiatList);
  return fiats;
};
