import { Pool } from 'pg'
import { injectable, inject } from 'inversify'
import { CONFIG } from '@config'
import LLogger from '@core/Logger'

@injectable()
export default class PostGresDatabase {
  @inject(LLogger.name) private _logger: LLogger

  private wrapperDbConnection = new Pool({
    connectionString: CONFIG.POSTGRESQL.URL
  })

  constructor(@inject(LLogger.name) logger: LLogger) {
    this._logger = logger
    this.authenticate()
  }

  public getConnection() {
    return this.wrapperDbConnection
  }

  public async authenticate() {
    try {
      await this.wrapperDbConnection.connect()
      this._logger.info('Wrapper PostGres connection has been established successfully.')
    } catch (err) {
      this._logger.error('Unable to connect to the wrapper PostGres database:', err)
    }
  }
}
