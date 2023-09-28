import dotenv from 'dotenv'
import { IConfigs } from 'oracle-base'
import { ChainSupported } from './constants'
import { ASSET_PRICE_ANCHOR_ABI } from './contracts/price.oracle'
import { RANDOM_ORACLE_ANCHOR_ABI } from './contracts/randomness.oracle'

dotenv.config()

export const ENV_CONFIG: IConfigs = {
  PORT: Number(process.env.PORT || 3000),

  ORACLE_TYPE: Number(process.env.ORACLE_TYPE || 0),

  SYSTEM: {
    APPLICATION_NAME: 'Oracle Federation',
    ENV: String(process.env.NODE_ENV || 'development'),
    TIME: {
      YYYY_MM_DD_HH_mm: 'YYYY-MM-DD HH:mm',
      UTC_OFFSET: '+00:00',
      DOT_YYYYMMDD: 'YYYY.MM.DD'
    }
  },

  CHAINS: {
    [ChainSupported.AlephZero]: {
      PROVIDER: String(process.env.BLOCKCHAIN_NODE || 'https://rpc.test.azero.dev')
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
      FREQUENCY_SECONDS: Number(process.env.FREQUENCY_SECONDS || 120),
      SLEEP_SECONDS: Number(process.env.SLEEP_SECONDS || 120),
      DEVIATION_PERMILLE: Number(process.env.DEVIATION_PERMILLE || 10),
      UPDATER_PRIVATE_KEY: String(process.env.PRIVATE_KEY),
      CONTRACTS: {
        ALEPH_ZERO: {
          ASSET_PRICE_ANCHOR: {
            ADDRESS: String(process.env.DEPLOYED_CONTRACT),
            ABI: ASSET_PRICE_ANCHOR_ABI
          }
        }
      },
      ASSETS: String(process.env.ASSETS)
    },

    ORACLE_RANDOMNESS: {
      UPDATER_PRIVATE_KEY: String(process.env.PRIVATE_KEY),
      SLEEP_SECONDS: Number(process.env.SLEEP_SECONDS || 120),
      CONTRACTS: {
        ALEPH_ZERO: {
          RANDOMNESS_ORACLE: {
            ADDRESS: String(process.env.DEPLOYED_CONTRACT),
            ABI: RANDOM_ORACLE_ANCHOR_ABI
          }
        }
      }
    },

    EXTERNAL: {
      DIA: {
        API_ROOT: 'https://api.diadata.org'
      },
      DRAND: {
        API_ROOT: 'https://drand.cloudflare.com'
      }
    }
  }
}
