export type Tariff = {
  id: number;
  name: string;
  description: string;
  price: number;
  amlRequests: number;
  refillGasRequests: number;
  includeKyc: boolean;
};
