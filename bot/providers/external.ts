import { inject, injectable } from 'inversify'
import { CONFIG } from '@config'
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import LLogger from '@core/Logger'

@injectable()
export default class ExternalProvider {
  @inject(LLogger.name) private _logger: LLogger

  public readonly V1_DIA_ASSETS_API_INSTANCE = axios.create({
    baseURL: `${CONFIG.MODULES.EXTERNAL.DIA.API_ROOT}/v1`,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Accept: 'application/json'
    },
    withCredentials: false,
    timeout: 30000,
    transformRequest: [
      data => {
        data = JSON.stringify(data)
        return data
      }
    ],
    transformResponse: [
      data => {
        try {
          data = JSON.parse(data)
          return data
        } catch (error) {
          this._logger.error(`Can not parse data: ${error}`)
        }
        return data
      }
    ]
  })

  constructor(@inject(LLogger.name) _logger: LLogger) {
    this._logger = _logger
    this._initDiaDataApiInstance()
  }

  private _initDiaDataApiInstance() {
    this.V1_DIA_ASSETS_API_INSTANCE.interceptors.request.use(
      (axiosConfig: AxiosRequestConfig) => {
        return axiosConfig
      },
      err => {
        return Promise.reject(err)
      }
    )
    this.V1_DIA_ASSETS_API_INSTANCE.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        this._logger.error(`External API response error: ${error}`)
        return Promise.reject(error.response?.data)
      }
    )
  }

  private requestErrorHandler(method: string, error: any) {
    this._logger.error(`External API request ${method} error: ${error?.message}`)
  }

  public async getAssetPrice(
    params: { chain: string; token_address: string },
    query: {
      timestamp: number
    }
  ) {
    try {
      const resp = await this.V1_DIA_ASSETS_API_INSTANCE.get(`/assetQuotation/${params.chain}/${params.token_address}`, {
        params: query
      })
      return {
        data: resp!.data,
        error: null
      }
    } catch (error) {
      this.requestErrorHandler('getAssetPrice', error)
      return {
        data: null,
        error: error ?? 'unknown error'
      }
    }
  }
}
