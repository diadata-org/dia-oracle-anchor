import { injectable, inject } from 'inversify'
import { CronJob } from 'cron'
import JobProvider from '@providers/job'
import LLogger from '@core/Logger'
import OracleService from './oracle.service'

@injectable()
export default class OracleIndexer {
  @inject(LLogger.name) private _lLogger: LLogger
  @inject(JobProvider.name) private _jobProvider: JobProvider
  @inject(OracleService.name) private _oracleService: OracleService

  constructor(
    @inject(LLogger.name) lLogger: LLogger,
    @inject(JobProvider.name) redisProvider: JobProvider, //
    @inject(OracleService.name) oracleService: OracleService
  ) {
    this._lLogger = lLogger
    this._jobProvider = redisProvider
    this._oracleService = oracleService
  }

  /* Ethereum */
  public initOracleAssetPriceSubmitter() {
    const _cron = new CronJob(
      '*/2 * * * *',
      async () => {
        try {
          await this._jobProvider.execute(
            {
              parent: 'oracle',
              id: 'oracle_asset_price_submitter_job',
              ttl: 60 * 30,
              data: []
            },
            async () => {
              return await this._oracleService.submitAssetPrice()
            }
          )
        } catch (err) {
          this._lLogger.error(`Error while adding job: ${err}`)
        }
      },
      null,
      true
    )

    _cron.start()
    return _cron
  }
}
