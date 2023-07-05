import { Router } from 'express'
import { IRouter } from 'oracle-base'
import { injectable, inject } from 'inversify'
import asyncHandler from '@helpers/asyncHandler'
import OracleController from './oracle.controller'

@injectable()
export default class OracleRouter implements IRouter {
  @inject(OracleController.name) private _oracleController: OracleController

  public path = '/oracle'
  public router = Router()

  constructor(@inject(OracleController.name) oracleController: OracleController) {
    this._oracleController = oracleController
    this.initRoutes()
  }

  private initRoutes() {
    this.router.get(`${this.path}`, asyncHandler(this._oracleController.getTransactionLogs()))
  }
}
