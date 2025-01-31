export enum BlockchainTransactionType {
  drain = 0,
  fee = 1,
  receive = 2,
  send = 3,
  monitoring_incoming_readonly = 4,
  contract_call = 5,
  unknown = 100,
}

export enum BlockchainTransactionStatus {
  pending = 0,
  success = 1,
  failed = 2,
  confirmed = 3,
}

export enum BlockchainTransactionStatusLabel {
  info = 0,
  success = 1,
  danger = 2,
  warm = 3,
}

export enum InvoiceStatuses {
  "Waiting for payment" = 1,
  Cancelled = 2,
  "Full filled" = 3,
}

export enum UserPermissions {
  LIST_OF_USERS = 1,
  ACT_AS_USER = 4,
  CANCELED = 6
}

export enum TradeStatuses {
  Completed = 5,
  'Canceled/ Expired' = 6
}
