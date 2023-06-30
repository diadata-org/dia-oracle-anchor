declare module 'oracle' {
  /**
   * Interfaces section
   */
  import { IBaseModel } from 'oracle-base'

  export interface ITransactionLogs extends IBaseModel {
    note?: string
    event: string
    block_number?: number
    block_hash?: string
    hash: string
    nonce?: number
    from?: string
    to?: string
    value?: string
    data?: string
    status: string
  }
}
