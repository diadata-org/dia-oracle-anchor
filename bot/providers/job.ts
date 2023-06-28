import { injectable, inject } from 'inversify'
import RedisProvider from './redis'
import LLogger from '@core/Logger'

@injectable()
export default class JobProvider {
  @inject(RedisProvider.name) private _redisProvider: RedisProvider
  @inject(LLogger.name) private _logger: LLogger

  constructor(
    @inject(RedisProvider.name) redisProvider: RedisProvider, //
    @inject(LLogger.name) logger: LLogger
  ) {
    this._redisProvider = redisProvider
    this._logger = logger
  }

  public async execute(
    job: {
      parent: string //
      id: string
      ttl?: number
      data: any[]
    },
    process: any
  ) {
    const lockKey = `${job.parent}:${job.id}`
    const lockValue = await this._redisProvider.get(lockKey)
    if (lockValue) {
      return
    }
    await this._redisProvider.setEX(lockKey, '1', job.ttl ?? 30)
    const events: string[] = []
    events.push(`Working on job ${job.id}: ${new Date()}`)
    try {
      const res = await process(job.data)
      events.push(`Result: ${JSON.stringify(res)}`)
    } catch (err: any) {
      events.push(`Error: ${err} - ${err?.stack}`)
    } finally {
      await this._redisProvider.del(lockKey)
    }
    events.push(`Done job ${job.id}: ${new Date()}`)
    this._logger.info(events.join(':::::'))
  }
}
