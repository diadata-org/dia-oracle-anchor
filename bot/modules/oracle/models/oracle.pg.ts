import { CONFIG } from '@config'
import PostGresDatabase from '@db/pg'
import { inject, injectable } from 'inversify'
import { ITransactionLogs } from 'oracle'
import { DataTypes, Model } from 'sequelize'

@injectable()
export default class OracleModel {
  @inject(PostGresDatabase.name) private _postGresDatabase: PostGresDatabase

  public readonly TransactionLogEntityModel

  constructor(@inject(PostGresDatabase.name) postGresDatabase: PostGresDatabase) {
    this._postGresDatabase = postGresDatabase
    const sequelize = this._postGresDatabase.getSequelize()
    this.TransactionLogEntityModel = sequelize.define<Model<ITransactionLogs, {}>>(
      'TransactionLog',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        event: {
          type: DataTypes.STRING,
          allowNull: true
        },
        hash: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        tableName: CONFIG.POSTGRESQL.TABLES.TRANSACTION_LOGS,
        createdAt: 'created',
        updatedAt: 'modified',
        deletedAt: 'removed'
      }
    )
    this.TransactionLogEntityModel.sync()
  }
}
