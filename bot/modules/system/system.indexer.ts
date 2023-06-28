import { injectable, inject } from 'inversify'
import { CronJob } from 'cron'
import SystemService from './system.service'
import LLogger from '@core/Logger'

@injectable()
export default class SystemIndexer {
  @inject(LLogger.name) private _logger: LLogger
  @inject(SystemService.name) private _systemService: SystemService

  constructor(@inject(LLogger.name) logger: LLogger, @inject(SystemService.name) systemService: SystemService) {
    this._logger = logger
    this._systemService = systemService
  }

  public initJobsPingingQueue(crons: CronJob[]) {
    setInterval(async () => {
      try {
        await this._systemService.pingingCronJobs(crons)
      } catch (error) {
        this._logger.error(`Error while pinging jobs: ${error}`)
      }
    }, 1000 * 60) // 1 minute
  }
}
