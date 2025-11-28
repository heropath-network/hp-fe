import { MUX_V3_ORACLE_API } from '@/packages/mux-v3'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_TIMEOUT = 20_000 // 20 seconds

export class APIClient {
  protected axios: AxiosInstance

  constructor(serverUrl: string, timeout = API_TIMEOUT) {
    this.axios = axios.create({
      baseURL: serverUrl,
      timeout: timeout,
    })
  }

  request(config: AxiosRequestConfig) {
    return this.axios.request(config)
  }

  setHeader(options: { [key: string]: string | number }) {
    this.axios.defaults.headers = { ...this.axios.defaults.headers, ...options }
  }

  setResponseInterceptors(
    onFulfilled?: (value: any) => any | Promise<any>,
    onRejected?: (error: any) => any
  ) {
    this.axios.interceptors.response.use(onFulfilled, onRejected)
  }
}

export class OracleServerAPIClient extends APIClient {
  constructor(serverUrl: string, timeout = API_TIMEOUT) {
    super(serverUrl, timeout)
    this.setDefaultResponseInterceptors()
  }

  setDefaultResponseInterceptors() {
    this.setResponseInterceptors(
      (response) => {
        if (response.status !== 200) {
          throw new Error(`Oracle API Error: ${response.statusText}`)
        }
        return response.data
      },
      function (error) {
        return Promise.reject(error)
      }
    )
  }
}

export const defaultOracleServerApiClient = () => new OracleServerAPIClient(MUX_V3_ORACLE_API)

