import { CONFIG } from '@config'
import LLogger from '@core/Logger'
import AlephZeroProvider from '@providers/blockchain/aleph'
import ExternalProvider from '@providers/external'
import NotificationProvider from '@providers/notification'
import { inject, injectable } from 'inversify'
import moment from 'moment'

@injectable()
export default class OracleService {
  @inject(LLogger.name) private _logger: LLogger
  @inject(AlephZeroProvider.name) private _alephZeroProvider: AlephZeroProvider
  @inject(ExternalProvider.name) private _externalProvider: ExternalProvider
  @inject(NotificationProvider.name) private _notificationProvider: NotificationProvider

  constructor(
    @inject(LLogger.name) logger: LLogger, //
    @inject(AlephZeroProvider.name) alephZeroProvider: AlephZeroProvider,
    @inject(ExternalProvider.name) externalProvider: ExternalProvider,
    @inject(NotificationProvider.name) notificationProvider: NotificationProvider
  ) {
    this._logger = logger
    this._alephZeroProvider = alephZeroProvider
    this._externalProvider = externalProvider
    this._notificationProvider = notificationProvider
  }

  public async submitAssetPrice() {
    try {
      const configs = CONFIG.MODULES.ORACLE.CONTRACTS.ALEPH_ZERO.ASSET_PRICE_ANCHOR
      const api = await this._alephZeroProvider.getHttpApi()
      const contract = this._alephZeroProvider.getContractPromise(api, configs.ADDRESS, configs.ABI)

      const { error, data: tokenPrice } = await this._externalProvider.getAssetPrice(
        {
          // TODO_2: using vars
          chain: 'Bitcoin',
          token_address: '0x0000000000000000000000000000000000000000'
        },
        {
          timestamp: moment.utc().unix()
        }
      )

      if (error) {
        throw new Error(`Error while getting asset price: ${error}`)
      }

      const result = await this._alephZeroProvider.contractTx(
        api,
        this._alephZeroProvider.getAccountKeyring(CONFIG.MODULES.ORACLE.UPDATER_PRIVATE_KEY),
        contract,
        'setPrice',
        {},
        [`${tokenPrice.Symbol}/USD`, Math.floor(tokenPrice.Price)]
      )

      const txnHash = result.result?.toHuman()

      // TODO_2: store txnHash to db
      return {
        data: txnHash,
        error: null
      }
    } catch (err) {
      this._logger.error(`Can not submit asset price: ${String(err)}`)

      this._notificationProvider.sendTaskRunFailed({
        error: String(err),
        task_name: 'submitAssetPrice'
      })

      return {
        data: null,
        error: err
      }
    }
  }
}
