import { Container } from 'inversify'
import LLogger from '@core/Logger'
import RedisProvider from '@providers/redis'
import JobProvider from '@providers/job'
import ExternalProvider from '@providers/external'
import OracleService from '@modules/oracle/oracle.service'
import AlephZeroProvider from '@providers/blockchain/aleph'
import SiteRouter from '@modules/site/site.router'
import OracleIndexer from '@modules/oracle/oracle.indexer'
import NotificationProvider from '@providers/notification'
import LockProvider from '@providers/lock'
import DatabaseClient from './db/pg'
import OracleModel from '@modules/oracle/models/oracle.pg'
import OracleRepository from '@modules/oracle/oracle.repository'
import OracleController from '@modules/oracle/oracle.controller'
import OracleRouter from '@modules/oracle/oracle.router'

export class IoCConfigLoader {
  static container = new Container()

  private static loadCommons() {
    this.container.bind<LLogger>(LLogger.name).to(LLogger).inSingletonScope()
  }

  private static loadDatabases() {
    this.container.bind<DatabaseClient>(DatabaseClient.name).to(DatabaseClient).inSingletonScope()
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
    this.container.bind<SiteRouter>(SiteRouter.name).to(SiteRouter).inSingletonScope()

    this.container.bind<OracleModel>(OracleModel.name).to(OracleModel).inSingletonScope()
    this.container.bind<OracleRepository>(OracleRepository.name).to(OracleRepository).inSingletonScope()
    this.container.bind<OracleService>(OracleService.name).to(OracleService).inSingletonScope()
    this.container.bind<OracleController>(OracleController.name).to(OracleController).inSingletonScope()
    this.container.bind<OracleRouter>(OracleRouter.name).to(OracleRouter).inSingletonScope()
    this.container.bind<OracleIndexer>(OracleIndexer.name).to(OracleIndexer).inSingletonScope()
  }

  private static registerQueues() {
    const oracleIndexer = this.container.resolve<OracleIndexer>(OracleIndexer)
    // oracleIndexer.initOracleAssetPriceSubmitter()
    oracleIndexer.initOracleAssetPriceChecker()
  }

  private static async initQueues() {
    this.registerQueues()
  }

  public static load() {
    this.container = new Container({
      defaultScope: 'Singleton'
    })
    this.loadCommons()
    this.loadDatabases()
    this.loadProviders()

    // v3
    this.loadModules()
    this.initQueues()
  }
}
