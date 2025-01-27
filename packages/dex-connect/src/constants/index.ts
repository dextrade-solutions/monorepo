export enum TxStageStatuses {
  requested = 1,
  failed = 2,
  success = 3,
}

export enum WalletConnectionType {
  wcTron = 'walletconnect-tron',
  eip6963 = 'eip6963',
  solana = 'solana',
  ledgerSol = 'ledger-solana',
  ledgerTron = 'ledger-tron',
  ledgerBtc = 'ledger-btc',
  sats = 'sats-connect', // only for btc wallet extensions
  multiversxExtension = 'multiversx-extension',
  tronlink = 'tron',
  manual = 'manual', // just pasted address from clipboard
  keypair = 'keypair', // local generated private key
}

export const WC_PROJECT_ID = '1ee56a25a2dad471b92feb59898b7aa6';
export const WC_METADATA = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};
export const WC_PARAMS = {
  projectId: WC_PROJECT_ID,
  qrModalOptions: {
    themeVariables: {
      '--wcm-font-family': '"Open-sans", sans-serif',
      '--wcm-z-index': '1000',
    },
  },
};
