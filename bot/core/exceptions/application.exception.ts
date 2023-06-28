import { CONSTANTS } from '@config/constants'
import { IApiError, IException, IExceptionContext } from 'oracle-base'

class ApplicationException extends Error implements IApiError {
  status: number
  code: number
  message: string
  context?: IExceptionContext
  details?: string

  constructor(error: IException, context?: IExceptionContext) {
    super(error.message)
    Error.captureStackTrace(this, this.constructor)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.status = error.status || 500
    this.code = error.code || 0
    this.message = error.message || CONSTANTS.STATUS_CODES[500]
    this.details = error.details
    this.context = context
  }

  public resolve() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      details: this.details,
      context: this.context,
      stack: this.stack
    }
  }
}
export default ApplicationException
