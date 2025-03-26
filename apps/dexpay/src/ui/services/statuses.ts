import { PaletteColor } from "@mui/material";

export enum BlockchainTransactionStatus {
  pending = 0,
  success = 1,
  failed = 2,
  confirmed = 3,
}

export enum TxStatus {
  Pending = -1,
  PendingZero = 0, // Added a separate enum for 0 to avoid duplicate values
  InProcess = 1,
  Failed = 2,
  Success = 3,
  SentToBlockchain = 4,
  ProjectNotFound = 5,
  RequestNotFound = 6,
  InsufficientBalance = 7,
  InsufficientNativeTokenBalance = 8,
  UndefinedError = -5,
  WaitingFor2FA = 51,
}

export const WITHDRAWAL_STATUS_LABEL: {
  [key in TxStatus]: { label: string; color: PaletteColor['main'] };
} = {
  [TxStatus.Pending]: { label: 'Pending', color: 'warning.main' },
  [TxStatus.PendingZero]: { label: 'Pending', color: 'warning.main' },
  [TxStatus.InProcess]: { label: 'In Process', color: 'info.main' },
  [TxStatus.Failed]: { label: 'Failed', color: 'error.main' },
  [TxStatus.Success]: { label: 'Success', color: 'success.main' },
  [TxStatus.SentToBlockchain]: {
    label: 'Sent to Blockchain',
    color: 'primary.main',
  },
  [TxStatus.ProjectNotFound]: {
    label: 'Project Not Found',
    color: 'error.main',
  },
  [TxStatus.RequestNotFound]: {
    label: 'Request Not Found',
    color: 'error.main',
  },
  [TxStatus.InsufficientBalance]: {
    label: 'Insufficient Balance',
    color: 'error.main',
  },
  [TxStatus.InsufficientNativeTokenBalance]: {
    label: 'Insufficient Native Token Balance',
    color: 'error.main',
  },
  [TxStatus.UndefinedError]: {
    label: 'Undefined Error',
    color: 'error.main',
  },
  [TxStatus.WaitingFor2FA]: {
    label: 'Waiting for 2FA',
    color: 'warning.main',
  },
};