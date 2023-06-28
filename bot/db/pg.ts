import { injectable, inject } from 'inversify'
import { CONFIG } from '@config'
import LLogger from '@core/Logger'
import { Sequelize } from 'sequelize'

@injectable()
export default class PostGresDatabase {
  @inject(LLogger.name) private _logger: LLogger

  private sequelize: Sequelize

  constructor(@inject(LLogger.name) logger: LLogger) {
    this._logger = logger
    this.init()
  }

  private async init() {
    try {
      this.sequelize = new Sequelize(CONFIG.POSTGRESQL.URI_CONNECTION, {
        dialect: 'postgres'
      })
      await this.sequelize.query(`CREATE DATABASE ${CONFIG.POSTGRESQL.DATABASE};`)
      this._logger.info('Wrapper PostGres database has been created successfully.')
    } catch (err: any) {
      this._logger.error('Unable to create database:', err)
    } finally {
      this.sequelize = new Sequelize(CONFIG.POSTGRESQL.URI_CONNECTION, {
        database: CONFIG.POSTGRESQL.DATABASE,
        dialect: 'postgres'
      })
    }
  }

  public async validate() {
    try {
      await this.sequelize.authenticate()
      this._logger.info('Connection has been established successfully.')
    } catch (err) {
      this._logger.error('Unable to connect to the database:', err)
    }
  }

  public getSequelize() {
    return this.sequelize
  }
}
