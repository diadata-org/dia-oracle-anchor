import DatabaseClient from '@db/pg'
import { inject, injectable } from 'inversify'

@injectable()
export default class OracleModel {
  @inject(DatabaseClient.name) private _databaseClient: DatabaseClient

  public readonly TransactionLogEntityModel

  constructor(@inject(DatabaseClient.name) databaseClient: DatabaseClient) {
    this._databaseClient = databaseClient
    const prisma = this._databaseClient.getCursor()
    this.TransactionLogEntityModel = prisma.transactionLog
  }
}
