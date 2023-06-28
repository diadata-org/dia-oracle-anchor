import { createClient, RedisClientType } from 'redis'
import { inject, injectable } from 'inversify'
import { CONFIG } from '@config'
import LLogger from '@core/Logger'

@injectable()
export default class RedisProvider {
  @inject(LLogger.name) private _logger: LLogger

  protected redis: RedisClientType<any>
  public readonly REDIS_PORT = CONFIG.REDIS.PORT
  public readonly REDIS_HOST = CONFIG.REDIS.URL

  constructor(
    @inject(LLogger.name) logger: LLogger //
  ) {
    this._logger = logger

    this.redis = createClient({
      url: `redis://${this.REDIS_HOST}:${this.REDIS_PORT}`
    })

    this.redis.on('error', (err: any) => {
      this.disconnect()
      this._logger.info(`Redis Client Error: ${err}`)
    })
    this.connect()
  }

  public async cleanKeys(pattern: string) {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      const res = await this.redis.del(keys)
      this._logger.info(`Redis Client Cleaned ${res} keys`)
    }
  }

  public async connect() {
    return await this.redis.connect()
  }

  public async disconnect() {
    return await this.redis?.disconnect()
  }

  public async set(key: string, value: string | number) {
    return await this.redis.set(`${CONFIG.REDIS.PREFIX}_${key}`, value)
  }

  public async setNX(key: string, value: string | number) {
    return await this.redis.set(`${CONFIG.REDIS.PREFIX}_${key}`, value, {
      NX: true
    })
  }

  public async setEX(key: string, value: string | number, seconds: number) {
    return await this.redis.set(`${CONFIG.REDIS.PREFIX}:${key}`, value, {
      EX: seconds
    })
  }

  public async getSetEX(key: string, value: string | number, seconds: number) {
    return await this.redis.set(`${CONFIG.REDIS.PREFIX}_${key}`, value, {
      EX: seconds
    })
  }

  public async get(key: string) {
    return await this.redis.get(`${CONFIG.REDIS.PREFIX}_${key}`)
  }

  public async del(key: string) {
    return await this.redis.del(`${CONFIG.REDIS.PREFIX}_${key}`)
  }

  public async incrBy(key: string, count: number) {
    return await this.redis.incrBy(`${CONFIG.REDIS.PREFIX}_${key}`, count)
  }

  public async decrBy(key: string, count: number) {
    return await this.redis.decrBy(`${CONFIG.REDIS.PREFIX}_${key}`, count)
  }

  public async exists(key: string) {
    return await this.redis.exists(`${CONFIG.REDIS.PREFIX}_${key}`)
  }
}
