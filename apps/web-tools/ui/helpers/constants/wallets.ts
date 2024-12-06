export enum WalletConnectionType {
  eip6963 = 'eip6963',
  solana = 'solana',
  ledgerSol = 'ledger-solana',
  ledgerTron = 'ledger-tron',
  ledgerBtc = 'ledger-btc',
  sats = 'sats-connect', // only for btc wallet extensions
  multiversxExtension = 'multiversx-extension',
  manual = 'manual', // just pasted address from clipboard
}
