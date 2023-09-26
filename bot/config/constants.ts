import { STATUS_CODES } from './status.code'

export enum ChainSupported {
  AlephZero = 'AlephZero'
}

export enum TransactionEvent {
  SetAssetPrice = 'SetAssetPrice'
}

export enum RandomOracleEvent {
  RandomnessPointAdded = 'RandomnessPointAdded'
}

export enum TransactionStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
  Untracked = 'Untracked'
}

export const PRECISION_DECIMALS = 18

export const CONSTANTS = {
  STATUS_CODES
}
