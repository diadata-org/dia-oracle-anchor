declare module 'oracle-request' {
  /**
   * Interfaces section
   */
  import { Request } from 'express'
  export interface CustomRequest extends Request {
    agent?: any
    ip_address?: string
    body: any
    params: any
    query: any
  }

  export interface PaginateRequest {
    paginate: { [key: string]: any }
  }
}
