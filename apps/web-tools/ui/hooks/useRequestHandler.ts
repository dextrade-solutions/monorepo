import { useGlobalModalContext } from 'dex-ui';
import { useDispatch } from 'react-redux';

import { handleRequest } from '../helpers/utils/requests';

export function useRequestHandler() {
  const { showModal } = useGlobalModalContext();
  const dispatch = useDispatch();
  return {
    handleRequest: (request: Promise<any>) =>
      handleRequest(dispatch, request, { showModal }),
  };
}
