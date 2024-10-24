import { useDispatch } from 'react-redux';

import { useAuthP2P } from './useAuthP2P';
import { handleRequest } from '../helpers/utils/requests';

export function useRequestHandler() {
  const dispatch = useDispatch();
  const auth = useAuthP2P();
  return {
    handleRequest: (request: Promise<any>) =>
      handleRequest(dispatch, request).catch(async () => {
        await auth();
      }),
  };
}
