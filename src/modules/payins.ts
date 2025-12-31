/**
 * Payins module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type {
  CreateCardDirectPayinRequest,
  CreateRecurringCitPayinRequest,
  CreateRecurringMitPayinRequest,
  CreateRecurringPaymentRequest,
  CreateRefundRequest,
  Payin,
  RecurringPaymentRegistration,
  Refund,
  UpdateRecurringPaymentRequest,
} from '../types/payins.js'

/**
 * Payins API module
 */
export class PayinsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/payins')
  }

  /**
   * Create a card direct payin
   */
  async create(data: CreateCardDirectPayinRequest): Promise<Payin> {
    return this.post<Payin>('', data)
  }

  /**
   * Get a payin by ID
   */
  async getPayin(payinId: string): Promise<Payin> {
    return this.client.get<Payin>(this.path(payinId))
  }

  /**
   * Refund a payin
   */
  async refund(payinId: string, data: CreateRefundRequest): Promise<Refund> {
    return this.post<Refund>(`${payinId}/refund`, data)
  }

  /**
   * Create a recurring payment registration
   */
  async createRecurringPayment(
    data: CreateRecurringPaymentRequest
  ): Promise<RecurringPaymentRegistration> {
    return this.post<RecurringPaymentRegistration>('createRecurringPayment', data)
  }

  /**
   * View a recurring payment registration
   */
  async viewRecurringPayment(registrationId: string): Promise<RecurringPaymentRegistration> {
    return this.client.get<RecurringPaymentRegistration>(
      this.path(['viewRecurringPayment', registrationId])
    )
  }

  /**
   * Create a recurring CIT (Customer-Initiated Transaction) payin
   */
  async createRecurringCit(data: CreateRecurringCitPayinRequest): Promise<Payin> {
    return this.post<Payin>('createRecurringPayInRegistrationCIT', data)
  }

  /**
   * Create a recurring MIT (Merchant-Initiated Transaction) payin
   */
  async createRecurringMit(data: CreateRecurringMitPayinRequest): Promise<Payin> {
    return this.post<Payin>('createRecurringPayInRegistrationMIT', data)
  }

  /**
   * Update a recurring payment registration
   */
  async updateRecurringPayment(
    registrationId: string,
    data: UpdateRecurringPaymentRequest
  ): Promise<RecurringPaymentRegistration> {
    return this.put<RecurringPaymentRegistration>(`updateRecurringPayin/${registrationId}`, data)
  }

  /**
   * End a recurring payment registration
   */
  async endRecurringPayment(registrationId: string): Promise<RecurringPaymentRegistration> {
    return this.updateRecurringPayment(registrationId, { Status: 'ENDED' })
  }
}
