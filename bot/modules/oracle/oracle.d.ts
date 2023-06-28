declare module 'oracle' {
  /**
   * Interfaces section
   */
  import { IBaseModel } from 'oracle-base'

  export interface ITransactionLogs extends IBaseModel {
    event: string
    hash: string
  }
}
