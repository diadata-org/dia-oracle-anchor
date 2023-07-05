import { injectable, inject } from 'inversify'
import LLogger from '@core/Logger'
import LockProvider from './lock'

@injectable()
export default class JobProvider {
  @inject(LockProvider.name) private _lockProvider: LockProvider
  @inject(LLogger.name) private _logger: LLogger

  constructor(
    @inject(LockProvider.name) lockProvider: LockProvider, //
    @inject(LLogger.name) logger: LLogger
  ) {
    this._lockProvider = lockProvider
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
    const lockValue = await this._lockProvider.get(lockKey)
    if (lockValue) {
      return
    }
    await this._lockProvider.setEX(lockKey, '1', job.ttl ?? 30)
    const events: string[] = []
    events.push(`Working on job ${job.id}: ${new Date()}`)
    try {
      const res = await process(job.data)
      events.push(`Result: ${JSON.stringify(res)}`)
    } catch (err: any) {
      events.push(`Error: ${err} - ${err?.stack}`)
    } finally {
      await this._lockProvider.del(lockKey)
    }
    events.push(`Done job ${job.id}: ${new Date()}`)
    this._logger.info(events.join(':::::'))
  }
}
