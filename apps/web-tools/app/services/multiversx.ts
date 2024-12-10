import { ApiNetworkProvider } from '@multiversx/sdk-core';

const BASE_URL = 'https://api.multiversx.com';

export const multiversxService = new ApiNetworkProvider(BASE_URL, {
  clientName: 'multiversx-your-client-name',
});
