import { QueryClient } from '@tanstack/react-query';

import { store } from '../../ui/store/store';

class SwapsController {
  private activeSwapsInterval: ReturnType<typeof setTimeout>;

  private queryClient: QueryClient;

  constructor({ queryClient }: { queryClient: QueryClient }) {
    this.activeSwapsInterval = setInterval(() => {
      this.refreshActiveSwaps();
    }, 4000);
    this.queryClient = queryClient;
  }

  stop() {
    clearInterval(this.activeSwapsInterval);
  }

  async refreshActiveSwaps() {
    if (!store.getState().auth.authData.apikey) {
      return;
    }

    await this.queryClient.refetchQueries({ queryKey: ['p2pTradesActive'] });
  }
}

export default SwapsController;
