import { CHAIN_IDS } from '../../../../../shared/constants/network';

// https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v2-contracts/router-v2
export const BSC_ROUTER_V2_CONTRACT =
  '0x10ED43C718714eb63d5aA57B78B54704E256024E';
export const ETH_ROUTER_V2_CONTRACT =
  '0xEfF92A263d31888d860bD50809A8D171709b7b1c';

export const ROUTER_V2_CONTRACT = {
  [CHAIN_IDS.BSC]: BSC_ROUTER_V2_CONTRACT,
  [CHAIN_IDS.MAINNET]: ETH_ROUTER_V2_CONTRACT,
};

// https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v3-contracts
export const ETH_SMART_ROUTER_V3_CONTRACT =
  '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4';

export const BSC_SMART_ROUTER_V3_CONTRACT =
  '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4';

export const SMART_ROUTER_V3_CONTRACT = {
  [CHAIN_IDS.BSC]: BSC_SMART_ROUTER_V3_CONTRACT,
  [CHAIN_IDS.MAINNET]: ETH_SMART_ROUTER_V3_CONTRACT,
};

export const MULTICALL_V3_CONTRACT =
  '0xac1cE734566f390A94b00eb9bf561c2625BF44ea';
