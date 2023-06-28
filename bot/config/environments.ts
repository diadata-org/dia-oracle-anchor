import dotenv from 'dotenv'
import { IConfigs } from 'oracle-base'
import { ChainSupported } from './constants'
import { ASSET_PRICE_ANCHOR_ABI } from './contracts/price.oracle'

dotenv.config()

export const ENV_CONFIG: IConfigs = {
  PORT: Number(process.env.PORT || 3000),

  SYSTEM: {
    APPLICATION_NAME: 'Oracle Federation',
    ENV: String(process.env.NODE_ENV || 'development'),
    TIME: {
      YYYY_MM_DD_HH_mm: 'YYYY-MM-DD HH:mm',
      UTC_OFFSET: '+00:00',
      DOT_YYYYMMDD: 'YYYY.MM.DD'
    }
  },

  POSTGRESQL: {
    URI_CONNECTION: String(process.env.POSTGRESQL_URI_CONNECTION),
    DATABASE: String(process.env.POSTGRESQL_DATABASE),
    TABLES: {
      TRANSACTION_LOGS: 'transaction_logs'
    }
  },

  CHAINS: {
    [ChainSupported.AlephZero]: {
      PROVIDER: String(process.env.ALEPH_ZERO_PROVIDER || 'https://rpc.test.azero.dev')
    }
  },

  EMAIL_NOTIFICATION: {
    ENABLE_REPORT_TO_ADMIN: String(process.env.EMAIL_NOTIFICATION_ENABLE_REPORT_TO_ADMIN || 'disabled'), // enabled | disabled
    FROM_ADDRESS: String(process.env.EMAIL_NOTIFICATION_FROM_ADDRESS),
    TO_ADDRESS: String(process.env.EMAIL_NOTIFICATION_TO_ADDRESS),
    SEND_GRID_API_KEY: String(process.env.EMAIL_NOTIFICATION_SEND_GRID_API_KEY)
  },

  REDIS: {
    URL: String(process.env.REDIS_URL || '127.0.0.1'),
    PORT: Number(process.env.REDIS_PORT || 6379),
    PREFIX: '__oracle__'
  },

  MODULES: {
    ORACLE: {
      UPDATER_PRIVATE_KEY: String(process.env.MODULES_ORACLE_UPDATER_PRIVATE_KEY),
      CONTRACTS: {
        ALEPH_ZERO: {
          ASSET_PRICE_ANCHOR: {
            ADDRESS: String(process.env.MODULES_ORACLE_CONTRACTS_ALEPH_ZERO_ASSET_PRICE_ANCHOR_ADDRESS),
            ABI: ASSET_PRICE_ANCHOR_ABI
          }
        }
      }
    },

    EXTERNAL: {
      DIA: {
        API_ROOT: 'https://api.diadata.org'
      }
    }
  }
}
