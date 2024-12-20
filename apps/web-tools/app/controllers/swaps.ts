import { queryClient } from 'dex-helpers/shared';

import { store } from '../../ui/store/store';

class SwapsController {
  private activeSwapsInterval: ReturnType<typeof setTimeout>;

  constructor() {
    this.activeSwapsInterval = setInterval(() => {
      this.refreshActiveSwaps();
    }, 4000);
  }

  stop() {
    clearInterval(this.activeSwapsInterval);
  }

  async refreshActiveSwaps() {
    if (!store.getState().auth.authData.apikey) {
      return;
    }

    await queryClient.refetchQueries({ queryKey: ['p2pTradesActive'] });
  }
}

export default SwapsController;
