export enum BlockchainTransactionStatus {
  pending = 0,
  success = 1,
  failed = 2,
  confirmed = 3,
}

export const WITHDRAWAL_STATUS_LABEL = {
  '-1': 'PENDING',
  '0': 'PENDING',
  '1': 'IN_PROCESS',
  '2': 'FAILED',
  '3': 'SUCCESS',
  '4': 'SENT_TO_BLOCKCHAIN',
  '5': 'NOT_FOUND_PROJECT',
  '6': 'REQUEST_NOT_FOUND',
  '7': 'INSUFFICIENT_BALANCE',
  '8': 'INSUFFICIENT_NATIVE_TOKEN_BALANCE',
  '-5': 'UNDEFINED_ERROR',
  '51': 'WAITING_FOR_2FA',
};
