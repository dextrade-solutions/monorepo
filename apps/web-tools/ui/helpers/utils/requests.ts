import { AuthStatus } from '../../../app/constants/auth';
import { setStatus } from '../../ducks/auth';
import { AppDispatch } from '../../store/store';

export const handleRequest = async (
  dispatch: AppDispatch,
  request: Promise<any>,
  opts: {
    on401?: () => void;
    showModal?: (v: any) => void;
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
    if (!message) {
      message = e.error.message;
    }
    if (opts.showModal) {
      opts.showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: message,
      });
    }

    throw new Error(message);
  }
};
