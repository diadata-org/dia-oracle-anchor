import { injectable, inject } from 'inversify'
import { forEach } from 'lodash'
import { CronJob } from 'cron'
import LLogger from '@core/Logger'

@injectable()
export default class SystemService {
  @inject(LLogger.name) private _logger: LLogger

  constructor(
    @inject(LLogger.name) logger: LLogger //
  ) {
    this._logger = logger
  }

  public async pingingCronJobs(crons: CronJob[]) {
    const events: string[] = []
    events.push(`Checking total jobs ${crons.length}: ${new Date()}`)
    forEach(crons, (cron, idx) => {
      if (!cron.running) {
        events.push(`Job ${idx} is not running, restarting...`)
        cron.start()
      }
    })
    events.push(`Checked total jobs ${crons.length}: ${new Date()}`)
    this._logger.info(events.join(':::::'))
  }
}
