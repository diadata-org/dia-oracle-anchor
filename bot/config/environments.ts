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
    URL: String(process.env.POSTGRESQL_URL),
    TABLES: {
      LOGS: 'logs'
    }
  },

  CHAINS: {
    [ChainSupported.ALEPH_ZERO]: {
      PROVIDER: String(process.env.ALEPH_ZERO_PROVIDER || 'https://rpc.test.azero.dev')
    }
  },

  EMAIL_NOTIFICATION: {
    ENABLE_REPORT_TO_ADMIN: String(process.env.EMAIL_NOTIFICATION_ENABLE_REPORT_TO_ADMIN || 'enabled'), // enabled | disabled
    FROM_ADDRESS: 'tech@pellartech.com',
    TO_ADDRESS: 'tech@pellartech.com',
    SEND_GRID_API_KEY: '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'
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
