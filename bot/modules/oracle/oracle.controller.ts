import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import OracleService from './oracle.service'

@injectable()
export default class OracleController {
  @inject(OracleService.name) private _oracleService: OracleService

  public getTransactionLogs = () => {
    return async (req: Request, res: Response) => {
      const data = await this._oracleService.getTransactionLogs({
        paginate: { page_index: req.query.page_index, page_size: req.query.page_size }
      })
      return res.json(data)
    }
  }
}
