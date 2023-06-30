import { injectable, inject } from 'inversify'
import { ITransactionLogs } from 'oracle'
import OracleModel from './models/oracle.pg'
import { SortOrder } from 'oracle-base'

@injectable()
export default class OracleRepository {
  @inject(OracleModel.name) private _oracleModel: OracleModel

  constructor(@inject(OracleModel.name) oracleModel: OracleModel) {
    this._oracleModel = oracleModel
  }

  public async createTransactionLogs(
    records: Pick<
      ITransactionLogs,
      | 'note'
      | 'event' //
      | 'block_number'
      | 'block_hash'
      | 'hash'
      | 'nonce'
      | 'from'
      | 'to'
      | 'value'
      | 'data'
      | 'status'
    >[]
  ) {
    return await this._oracleModel.TransactionLogEntityModel.createMany({
      data: records //
    })
  }

  public async countTransactionLogsByConditions(params: {
    conditions: { [key: string]: any } //
  }) {
    return await this._oracleModel.TransactionLogEntityModel.count({
      where: params.conditions //
    })
  }

  public async findTransactionLogsByConditions(params: {
    conditions: { [key: string]: any } //
    projection?: { [key in keyof ITransactionLogs]?: boolean }
    sorts?: { [key in keyof ITransactionLogs]?: SortOrder }[]
    limit?: number
    skip?: number
  }) {
    return await this._oracleModel.TransactionLogEntityModel.findMany({
      where: params.conditions, //
      select: params.projection,
      take: params.limit,
      orderBy: params.sorts,
      skip: params.skip
    })
  }

  public async findOneByConditions(params: {
    conditions: { [key: string]: any } //
    projection?: { [key in keyof ITransactionLogs]?: boolean }
  }) {
    return await this._oracleModel.TransactionLogEntityModel.findFirst({
      where: params.conditions, //
      select: params.projection
    })
  }
}
