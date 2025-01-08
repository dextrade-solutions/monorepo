import { DexPlans } from 'dex-ui';

import usePaymodalHandlers from '../../hooks/usePaymodalHandlers';

export function Plans() {
  const paymodalHandlers = usePaymodalHandlers();

  return <DexPlans paymodalHandlers={paymodalHandlers} />;
}
