import { CONFIG } from '@config'
import { NextFunction, Request, Response } from 'express'
import { IException } from 'oracle-base'

export const exceptionMiddleware = (error: IException, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500
  if (CONFIG.SYSTEM.ENV === 'production') {
    return res.status(status).json({
      code: error.code,
      message: error.message,
      details: error.details
    })
  }

  return res.status(status).json({
    code: error.code,
    message: error.message,
    details: error.details,
    context: error.context,
    stack: error.stack
  })
}
