import { Response, NextFunction } from 'express'
import { CustomRequest } from 'oracle-request'

export const requestMiddleware = (req: CustomRequest, _: Response, next: NextFunction) => {
  req.query.page_index = Number(req.query.page_index || 1)
  req.query.page_size = Number(req.query.page_size || 15)
  req.agent = req.headers['user-agent']
  req.ip_address =
    String(req.headers['x-forwarded-for'] || '')
      .split(',')
      .pop()
      ?.trim() ||
    req.socket.remoteAddress ||
    req.ip
  next()
}
