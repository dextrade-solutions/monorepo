import { AuthStatus } from '../../../app/constants/auth';
import { setStatus } from '../../ducks/auth';
import { AppDispatch } from '../../store/store';

export const handleRequest = async (
  dispatch: AppDispatch,
  request: Promise<any>,
  opts: {
    on401?: () => void;
  } = {},
) => {
  try {
    const response = await request;
    return response;
  } catch (e) {
    if (e.status === 401) {
      dispatch(setStatus(AuthStatus.failed));
      if (opts.on401) {
        return opts.on401();
      }
    }
    let message = e.response?.data?.message;
    if (!message) {
      message = e.message;
    }

    throw new Error(message);
  }
};
