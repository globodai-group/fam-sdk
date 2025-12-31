/**
 * Transfers module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { Refund } from '../types/payins.js'
import type {
  CreateScaTransferRequest,
  CreateTransferRefundRequest,
  CreateTransferRequest,
  Transfer,
} from '../types/transfers.js'

/**
 * Transfers API module
 */
export class TransfersModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/transfers')
  }

  /**
   * Create a transfer
   */
  async create(data: CreateTransferRequest): Promise<Transfer> {
    return this.post<Transfer>('', data)
  }

  /**
   * Create an SCA transfer
   */
  async createSca(data: CreateScaTransferRequest): Promise<Transfer> {
    return this.post<Transfer>('sca', data)
  }

  /**
   * Get a transfer by ID
   */
  async getTransfer(transferId: string): Promise<Transfer> {
    return this.client.get<Transfer>(this.path(transferId))
  }

  /**
   * Get an SCA transfer by ID
   */
  async getSca(transferId: string): Promise<Transfer> {
    return this.client.get<Transfer>(this.path(['sca', transferId]))
  }

  /**
   * Refund a transfer
   */
  async refund(transferId: string, data: CreateTransferRefundRequest): Promise<Refund> {
    return this.post<Refund>(`${transferId}/refund`, data)
  }
}
