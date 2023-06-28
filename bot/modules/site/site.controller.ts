import { Router, Request, Response } from 'express'
import asyncHandler from '@helpers/asyncHandler'
import { IController } from 'oracle-base'
import { injectable } from 'inversify'

@injectable()
export default class SiteController implements IController {
  public path = '/sites'
  public router = Router()

  constructor() {
    this.initRoutes()
  }

  private initRoutes() {
    this.router.get(`${this.path}/hello`, asyncHandler(this.federationHeartBeat))
  }

  private async federationHeartBeat(req: Request, res: Response) {
    return res.send('Hello, From ORACLE Federation with love!')
  }
}
