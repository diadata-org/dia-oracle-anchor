import { IException, IExceptionContext } from 'oracle-base'
import BizException from './exceptions/biz.exception'
import RequestException from './exceptions/request.exception'

const exceptionMaps = {
  BizException,
  RequestException
}

type Keys = keyof typeof exceptionMaps

export class ApiErrorFactory {
  static handle(type: Keys, error: IException, context?: IExceptionContext): IException {
    const exceptionInstance = new exceptionMaps[type](error, context)
    switch (type) {
      case 'BizException':
      case 'RequestException':
        return exceptionInstance.resolve()
    }
  }
}
