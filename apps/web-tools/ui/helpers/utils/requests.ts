import { AuthStatus } from '../../../app/constants/auth';
import { showModal } from '../../ducks/app/app';
import { setStatus } from '../../ducks/auth';
import { AppDispatch } from '../../store/store';

export const handleRequest = async (
  dispatch: AppDispatch,
  request: Promise<any>,
) => {
  try {
    const response = await request;
    return response;
  } catch (e) {
    if (e.status === 401) {
      dispatch(setStatus(AuthStatus.failed));
    }
    let message = e.response?.data?.message;
    if (!message) {
      message = e.message;
    }

    dispatch(
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: message,
      }),
    );
    throw new Error(e);
  }
};
