import { injectable, inject } from 'inversify'
import LLogger from '@core/Logger'
import { PrismaClient } from '@prisma/client'

@injectable()
export default class DatabaseClient {
  @inject(LLogger.name) private _logger: LLogger

  private prismaClient: PrismaClient

  constructor(@inject(LLogger.name) logger: LLogger) {
    this._logger = logger
    this.init()
  }

  private async init() {
    try {
      this.prismaClient = new PrismaClient()
      this._logger.info('Wrapper Database has been created successfully.')
    } catch (err: any) {
      this._logger.error('Unable to create database:', err)
    }
  }

  public getCursor() {
    return this.prismaClient
  }
}
