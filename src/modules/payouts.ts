/**
 * Payouts module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { CreatePayoutRequest, Payout } from '../types/payouts.js'

/**
 * Payouts API module
 */
export class PayoutsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/payouts')
  }

  /**
   * Create a payout
   */
  async create(data: CreatePayoutRequest): Promise<Payout> {
    return this.post<Payout>('', data)
  }

  /**
   * Get a payout by ID
   */
  async getPayout(payoutId: string): Promise<Payout> {
    return this.client.get<Payout>(this.path(payoutId))
  }
}
