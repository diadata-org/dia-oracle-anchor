import { CronJob } from 'cron'
import { Container } from 'inversify'
import LLogger from '@core/Logger'
import RedisProvider from '@providers/redis'
import JobProvider from '@providers/job'
import ExternalProvider from '@providers/external'
import OracleService from '@modules/oracle/oracle.service'
import AlephZeroProvider from '@providers/blockchain/aleph'
import SiteController from '@modules/site/site.controller'
import OracleIndexer from '@modules/oracle/oracle.indexer'
import SystemIndexer from '@modules/system/system.indexer'
import SystemService from '@modules/system/system.service'
import NotificationProvider from '@providers/notification'
import LockProvider from '@providers/lock'
import PostGresDatabase from './db/pg'
import OracleModel from '@modules/oracle/models/oracle.pg'
import OracleRepository from '@modules/oracle/oracle.repository'

export class IoCConfigLoader {
  static container = new Container()

  private static loadCommons() {
    this.container.bind<LLogger>(LLogger.name).to(LLogger).inSingletonScope()
  }

  private static loadDatabases() {
    this.container.bind<PostGresDatabase>(PostGresDatabase.name).to(PostGresDatabase).inSingletonScope()
  }

  private static async initDataBases() {
    const postGresDatabase = this.container.resolve<PostGresDatabase>(PostGresDatabase)
    await postGresDatabase.validate()
  }

  private static loadProviders() {
    // providers
    this.container.bind<AlephZeroProvider>(AlephZeroProvider.name).to(AlephZeroProvider).inSingletonScope()
    this.container.bind<ExternalProvider>(ExternalProvider.name).to(ExternalProvider).inSingletonScope()
    this.container.bind<RedisProvider>(RedisProvider.name).to(RedisProvider).inSingletonScope()
    this.container.bind<LockProvider>(LockProvider.name).to(LockProvider).inSingletonScope()
    this.container.bind<NotificationProvider>(NotificationProvider.name).to(NotificationProvider).inSingletonScope()
    this.container.bind<JobProvider>(JobProvider.name).to(JobProvider).inSingletonScope()
  }

  public static loadModules() {
    this.container.bind<SiteController>(SiteController.name).to(SiteController).inSingletonScope()

    this.container.bind<OracleModel>(OracleModel.name).to(OracleModel).inSingletonScope()
    this.container.bind<OracleRepository>(OracleRepository.name).to(OracleRepository).inSingletonScope()
    this.container.bind<OracleService>(OracleService.name).to(OracleService).inSingletonScope()
    this.container.bind<OracleIndexer>(OracleIndexer.name).to(OracleIndexer).inSingletonScope()

    this.container.bind<SystemService>(SystemService.name).to(SystemService).inSingletonScope()
    this.container.bind<SystemIndexer>(SystemIndexer.name).to(SystemIndexer).inSingletonScope()
  }

  private static registerQueues() {
    const systemIndexer = this.container.resolve<SystemIndexer>(SystemIndexer)
    const oracleIndexer = this.container.resolve<OracleIndexer>(OracleIndexer)
    const crons: CronJob[] = []
    crons.push(
      oracleIndexer.initOracleAssetPriceSubmitter() //
    )
    systemIndexer.initJobsPingingQueue(crons)
  }

  private static async initQueues() {
    // const redisProvider = this.container.resolve<RedisProvider>(RedisProvider)
    // await redisProvider.cleanKeys(`${CONFIG.REDIS.PREFIX}*`)
    // // eslint-disable-next-line no-console
    // console.log('Redis cleaned')
    this.registerQueues()
  }

  public static async load() {
    this.container = new Container({
      defaultScope: 'Singleton'
    })
    this.loadCommons()
    this.loadDatabases()
    await this.initDataBases()
    this.loadProviders()

    // v3
    this.loadModules()
    this.initQueues()
  }
}
