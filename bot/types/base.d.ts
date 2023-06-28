declare module 'oracle-base' {
  import { ChainSupported } from '@config/constants'
  import { Router } from 'express'
  export interface IBaseModel {
    removed?: Boolean
    created?: Date
    modified?: Date
  }

  export interface IController {
    path: string
    router: Router
  }

  export interface IException {
    code: number
    status: number
    message: string
    stack?: any
    details?: any
    context?: any
  }

  export interface IExceptionContext {
    class_name: string
    method: string
    details?: any
  }

  export interface IApiError {
    public resolve(): IException
  }

  export interface IConfigs {
    PORT: number

    SYSTEM: {
      APPLICATION_NAME: string
      ENV: string
      TIME: {
        YYYY_MM_DD_HH_mm: string
        UTC_OFFSET: string
        DOT_YYYYMMDD: string
      }
    }

    POSTGRESQL: {
      URL: string
      TABLES: {
        LOGS: string
      }
    }

    CHAINS: {
      [key in ChainSupported]: {
        PROVIDER: string
      }
    }

    EMAIL_NOTIFICATION: {
      ENABLE_REPORT_TO_ADMIN: string
      FROM_ADDRESS: string
      TO_ADDRESS: string
      SEND_GRID_API_KEY: string
    }

    REDIS: {
      URL: string
      PORT: number
      PREFIX: string
    }

    MODULES: {
      ORACLE: {
        UPDATER_PRIVATE_KEY: string
        CONTRACTS: {
          ALEPH_ZERO: {
            ASSET_PRICE_ANCHOR: {
              ADDRESS: string
              ABI: any
            }
          }
        }
      }

      EXTERNAL: {
        DIA: {
          API_ROOT: string
        }
      }
    }
  }
}
