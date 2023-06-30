import { CONFIG } from '@config'
import LLogger from '@core/Logger'
import AlephZeroProvider from '@providers/blockchain/aleph'
import ExternalProvider from '@providers/external'
import NotificationProvider from '@providers/notification'
import { inject, injectable } from 'inversify'
import moment from 'moment'
import OracleRepository from './oracle.repository'
import { PRECISION_DECIMALS, TransactionEvent } from '@config/constants'
import { PaginateRequest } from 'oracle-request'
import toPaginate from '@helpers/toPaginate'

@injectable()
export default class OracleService {
  @inject(LLogger.name) private _logger: LLogger
  @inject(AlephZeroProvider.name) private _alephZeroProvider: AlephZeroProvider
  @inject(ExternalProvider.name) private _externalProvider: ExternalProvider
  @inject(NotificationProvider.name) private _notificationProvider: NotificationProvider
  @inject(OracleRepository.name) private _oracleRepository: OracleRepository

  constructor(
    @inject(LLogger.name) logger: LLogger, //
    @inject(AlephZeroProvider.name) alephZeroProvider: AlephZeroProvider,
    @inject(ExternalProvider.name) externalProvider: ExternalProvider,
    @inject(NotificationProvider.name) notificationProvider: NotificationProvider,
    @inject(OracleRepository.name) oracleRepository: OracleRepository
  ) {
    this._logger = logger
    this._alephZeroProvider = alephZeroProvider
    this._externalProvider = externalProvider
    this._notificationProvider = notificationProvider
    this._oracleRepository = oracleRepository
  }

  public async getTransactionLogs(params: PaginateRequest) {
    const { paginate } = params
    const offset = Math.max(paginate.page_index - 1, 0) * paginate.page_size

    const conditions = {}
    const count = await this._oracleRepository.countTransactionLogsByConditions({ conditions })
    const items = await this._oracleRepository.findTransactionLogsByConditions({
      conditions, //
      sorts: [{ created: 'desc' }],
      skip: offset,
      limit: paginate.page_size
    })
    return toPaginate(count, paginate.page_index, paginate.page_size, items)
  }

  public async checkIfNeedToSubmitAsset(chain: string, tokenAddress: string) {
    try {
      this._logger.info(`Check deviation permille asset price: ${chain}-${tokenAddress}`)
      const deviationPermille = Number(CONFIG.MODULES.ORACLE.DEVIATION_PERMILLE) / 100
      const configs = CONFIG.MODULES.ORACLE.CONTRACTS.ALEPH_ZERO.ASSET_PRICE_ANCHOR
      const api = await this._alephZeroProvider.getHttpApi()
      const contract = this._alephZeroProvider.getContractPromise(api, configs.ADDRESS, configs.ABI)

      const { error, data: tokenPrice } = await this._externalProvider.getAssetPrice(
        {
          chain: chain,
          token_address: tokenAddress
        },
        {
          timestamp: moment.utc().unix()
        }
      )

      if (error) {
        throw new Error(`Error while getting asset price: ${JSON.stringify(error)}`)
      }

      const latestTokenPrice = await this._alephZeroProvider.contractQuery(api, contract.address.toHex(), contract, 'getLatestPrice', {}, [
        `${tokenPrice.Symbol}/USD`
      ])

      const price = Number(
        this._alephZeroProvider.parseFromIntToFloat(String((latestTokenPrice.output?.toJSON() as any)?.ok?.[1]), PRECISION_DECIMALS)
      )

      const currentPrice = Number(tokenPrice.Price)

      if ((currentPrice - price) / price >= deviationPermille) {
        return await this.submitAssetPrice(chain, tokenAddress)
      }
    } catch (err) {
      this._logger.error(`Can not check asset price: ${String(err)}`)

      this._notificationProvider.sendTaskRunFailed({
        error: String(err),
        task_name: 'checkIfNeedToSubmitAsset'
      })

      return {
        data: null,
        error: err
      }
    }
  }

  public async submitAssetPrice(chain: string, tokenAddress: string) {
    try {
      this._logger.info(`Submit asset price: ${chain}-${tokenAddress}`)
      const configs = CONFIG.MODULES.ORACLE.CONTRACTS.ALEPH_ZERO.ASSET_PRICE_ANCHOR
      const api = await this._alephZeroProvider.getHttpApi()
      const contract = this._alephZeroProvider.getContractPromise(api, configs.ADDRESS, configs.ABI)

      const { error, data: tokenPrice } = await this._externalProvider.getAssetPrice(
        {
          chain: chain,
          token_address: tokenAddress
        },
        {
          timestamp: moment.utc().unix()
        }
      )

      if (error) {
        throw new Error(`Error while getting asset price: ${JSON.stringify(error)}`)
      }

      const result = await this._alephZeroProvider.contractTx(
        api,
        this._alephZeroProvider.getAccountKeyring(CONFIG.MODULES.ORACLE.UPDATER_PRIVATE_KEY),
        contract,
        'setPrice',
        {},
        [`${tokenPrice.Symbol}/USD`, this._alephZeroProvider.parseFromFloatToInt(String(tokenPrice.Price), PRECISION_DECIMALS)]
      )

      const txnHash = result.result?.toHex()

      const res = await this._alephZeroProvider.waitTx(api, txnHash, result.currentBlock.block.header.number.toNumber())

      await this._oracleRepository.createTransactionLogs([
        {
          note: `Submit asset price: ${tokenPrice.Symbol}/USD = ${tokenPrice.Price}`,
          event: TransactionEvent.SetAssetPrice,
          hash: txnHash,
          block_number: res.block?.block_number,
          block_hash: res.block?.block_hash,
          nonce: res.txn?.nonce,
          from: res.txn?.signer,
          to: res.txn.dest,
          value: res.txn?.value,
          data: res.txn?.data,
          status: res.status
        }
      ])

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
