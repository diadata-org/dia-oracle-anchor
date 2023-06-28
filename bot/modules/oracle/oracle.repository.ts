import { injectable, inject } from 'inversify'
import { ITransactionLogs } from 'oracle'
import OracleModel from './models/oracle.pg'
import { FindAttributeOptions, Order } from 'sequelize'

@injectable()
export default class OracleRepository {
  @inject(OracleModel.name) private _oracleModel: OracleModel

  constructor(@inject(OracleModel.name) oracleModel: OracleModel) {
    this._oracleModel = oracleModel
  }

  public async createTransactionLogs(
    records: Pick<
      ITransactionLogs,
      'event' | 'hash' //
    >[]
  ) {
    return await this._oracleModel.TransactionLogEntityModel.bulkCreate(records)
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
    projection?: FindAttributeOptions
    sort?: Order
    limit?: number
    skip?: number
  }) {
    return await this._oracleModel.TransactionLogEntityModel.findAndCountAll({
      where: params.conditions, //
      attributes: params.projection,
      limit: params.limit,
      order: params.sort,
      offset: params.skip
    })
  }

  public async findOneByConditions(params: {
    conditions: { [key: string]: any } //
    projection?: FindAttributeOptions
  }) {
    return await this._oracleModel.TransactionLogEntityModel.findOne({
      where: params.conditions, //
      attributes: params.projection
    })
  }
}
