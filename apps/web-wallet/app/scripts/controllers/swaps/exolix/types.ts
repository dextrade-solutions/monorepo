export const enum ERateType {
  FLOAT = 'float',
  FIXED = 'fixed',
}

export interface IRateQuery {
  coinFrom: string;
  networkFrom?: string;
  coinTo: string;
  networkTo?: string;
  amount: string;
  withdrawalAmount?: string;
  rateType: ERateType;
}
