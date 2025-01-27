import { DexPlans } from 'dex-ui';
import { useNavigate } from 'react-router-dom';

import { INVOICE_ROUTE } from '../../helpers/constants/routes';
import usePaymodalHandlers from '../../hooks/usePaymodalHandlers';

export function Plans() {
  const navigate = useNavigate();
  const paymodalHandlers = usePaymodalHandlers();

  const onBuyPlan = () => {
    navigate(INVOICE_ROUTE);
  };

  return <DexPlans onBuyPlan={onBuyPlan} paymodalHandlers={paymodalHandlers} />;
}
