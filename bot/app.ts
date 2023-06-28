import 'reflect-metadata'
import express from 'express'
import * as bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'

import { exceptionMiddleware } from '@core/middlewares/exception.middleware'
import { requestMiddleware } from '@core/middlewares/request.middleware'
import { CONFIG } from '@config'
import { forEach } from 'lodash'
import SiteController from '@modules/site/site.controller'
import { IoCConfigLoader } from './container'

class App {
  public app: express.Application
  constructor() {
    this.app = express()
    IoCConfigLoader.load()

    this.initMiddlewares()
    this.applyControllers()
    this.initErrorHandling()
  }

  public listen() {
    this.app.listen(CONFIG.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is listening on the port ${CONFIG.PORT}`)
    })
  }

  public getServer() {
    return this.app
  }

  private initMiddlewares(): void {
    // support application/json type post data
    this.app.use(bodyParser.json())
    // support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }))

    this.app.use(cors())
    this.app.use(helmet())
    this.app.use(requestMiddleware)
  }

  private initErrorHandling() {
    this.app.use(exceptionMiddleware)
  }

  private applyControllers() {
    forEach([IoCConfigLoader.container.resolve<SiteController>(SiteController)], controller => {
      this.app.use('/api/v1', controller.router)
    })
  }
}

export default App
