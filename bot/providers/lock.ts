import { inject, injectable } from 'inversify'
import LLogger from '@core/Logger'
import moment from 'moment'

@injectable()
export default class LockProvider {
  @inject(LLogger.name) private _logger: LLogger

  constructor(
    @inject(LLogger.name) logger: LLogger //
  ) {
    this._logger = logger
  }

  public async connect() {
    process.env.__LOCK = JSON.stringify({})
  }

  public async disconnect() {
    process.env.__LOCK = ''
  }

  public async set(key: string, value: string | number) {
    const lock = JSON.parse(process.env.__LOCK || '{}')
    lock[key] = {
      value,
      expire_at: null
    }
    process.env.__LOCK = JSON.stringify(lock)
  }

  public async setEX(key: string, value: string | number, seconds: number) {
    const lock = JSON.parse(process.env.__LOCK || '{}')
    lock[key] = {
      value,
      expire_at: moment.utc().unix() + seconds
    }
    process.env.__LOCK = JSON.stringify(lock)
  }

  public async get(key: string) {
    const lock = JSON.parse(process.env.__LOCK || '{}')
    const record = lock[key]?.value
    if (record?.expire_at && Number(record?.expire_at) < moment.utc().unix()) {
      return null
    }
    return record
  }

  public async del(key: string) {
    const lock = JSON.parse(process.env.__LOCK || '{}')
    delete lock[key]
    process.env.__LOCK = JSON.stringify(lock)
  }
}
