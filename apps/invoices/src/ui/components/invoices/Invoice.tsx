import { Box } from '@mui/material';
import { PulseLoader } from 'dex-ui';

import usePayment from '../../queries/usePayment';

export default function Invoice() {
  const queryId = 'dedcb32a-c592-416a-a826-79e5432dc94d-e1ce3f44edc1a4068cf05e66cc81c36c';
  const payment = usePayment({ id: queryId });
  return <Box m={1}>{payment.isLoading && <PulseLoader />}</Box>;
}
