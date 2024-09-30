export interface NetworkConfiguration {
  nickname?: string;
  network: string; // Chain identifier for p2p exchanges
  chainId: `0x${string}` | string;
  ticker: string;
  decimals?: number;
  rpcUrl?: string;
  blockExplorerUrl?: string;
}
