import OTCExchanges from '../otc-exchanges/otc-exchanges.component';
import P2PExchanges from '../p2p-exchanges/p2p-exchanges.component';
import DEXExchanges from '../dex-exchanges/dex-exchanges.component';
import ExchangerView from '../../../exchanger/exchanger-view';

export const EXCHANGER_TAB_NAME = {
  P2P_CLIENT: 'p2pTabClient',
  P2P_EXCHANGER: 'p2pTabExchanger',
  OTC: 'exchangerTabOtc',
  DEX: 'exchangerTabDex',
};

export const tabs = [
  {
    name: EXCHANGER_TAB_NAME.P2P_CLIENT,
    component: P2PExchanges,
  },
  {
    name: EXCHANGER_TAB_NAME.P2P_EXCHANGER,
    component: ExchangerView,
  },
  {
    name: EXCHANGER_TAB_NAME.OTC,
    component: OTCExchanges,
  },
  {
    name: EXCHANGER_TAB_NAME.DEX,
    component: DEXExchanges,
  },
];
