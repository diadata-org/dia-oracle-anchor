import { injectable, inject } from 'inversify'
import JobProvider from '@providers/job'
import LLogger from '@core/Logger'
import OracleService from './oracle.service'
import { split, trim } from 'lodash'
import { CONFIG } from '@config'

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
    const frequencySeconds = Number(CONFIG.MODULES.ORACLE.FREQUENCY_SECONDS)
    setInterval(async () => {
      try {
        await this._jobProvider.execute(
          {
            parent: 'oracle',
            id: 'oracle_asset_price_submitter_job',
            ttl: 60 * 30,
            data: []
          },
          async () => {
            const assets = split(trim(CONFIG.MODULES.ORACLE.ASSETS), ',')
            for (const asset of assets) {
              const tokenInfo = split(asset, '-')
              await this._oracleService.submitAssetPrice(trim(tokenInfo?.[0]), trim(tokenInfo?.[1]))
            }
          }
        )
      } catch (err) {
        this._lLogger.error(`Error while adding job: ${err}`)
      }
    }, 1000 * frequencySeconds) // frequencySeconds seconds
  }

  public initOracleAssetPriceChecker() {
    const sleepSeconds = Number(CONFIG.MODULES.ORACLE.SLEEP_SECONDS)
    setInterval(async () => {
      try {
        await this._jobProvider.execute(
          {
            parent: 'oracle',
            id: 'oracle_asset_price_submitter_job',
            ttl: 60 * 30,
            data: []
          },
          async () => {
            const deviationPermille = Number(CONFIG.MODULES.ORACLE.DEVIATION_PERMILLE)
            if (deviationPermille === 0) {
              this._lLogger.info('Deviation permille is 0, skip checking')
              return null
            }
            const assets = split(trim(CONFIG.MODULES.ORACLE.ASSETS), ',')
            for (const asset of assets) {
              const tokenInfo = split(asset, '-')
              await this._oracleService.checkIfNeedToSubmitAsset(trim(tokenInfo?.[0]), trim(tokenInfo?.[1]))
            }
          }
        )
      } catch (err) {
        this._lLogger.error(`Error while adding job: ${err}`)
      }
    }, 1000 * sleepSeconds) // frequencySeconds seconds
  }

  public initOracleRandomnessOracleChecker() {
    this._lLogger.info('Randomness oracle feeder started.')
    const sleepSeconds = Number(CONFIG.MODULES.ORACLE_RANDOMNESS.SLEEP_SECONDS)
    setInterval(async () => {
      try {
        await this._jobProvider.execute(
          {
            parent: 'oracle',
            id: 'oracle_randomness_submitter_job',
            ttl: 60 * 30,
            data: []
          },
          async () => {
            await this._oracleService.checkIfNeedToSubmitRandomnessUpdate(trim(''))
          }
        )
      } catch (err) {
        this._lLogger.error(`Error while adding job: ${err}`)
      }
    }, 1000 * sleepSeconds) // frequencySeconds seconds
  }
}
