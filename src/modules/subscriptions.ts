/**
 * Subscriptions module (FAM custom implementation)
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { PaginatedResponse } from '../types/common.js'
import type {
  LinkProductsRequest,
  LinkProductsResponse,
  MangopayUserSubscription,
  MangopayUserSubscriptionFilters,
  RecurringSubscription,
  RegisterSubscriptionRequest,
  SubscriptionListFilters,
  SubscriptionWithPayments,
  SyncSubscriptionResponse,
  UpdateSubscriptionRequest,
} from '../types/subscriptions.js'

/**
 * Recurring Subscriptions API module
 */
export class SubscriptionsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/recurring-subscriptions')
  }

  /**
   * Register a recurring subscription
   */
  async register(data: RegisterSubscriptionRequest): Promise<RecurringSubscription> {
    return this.post<RecurringSubscription>('', data)
  }

  /**
   * Get a subscription by ID (includes last 10 payments)
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionWithPayments> {
    return this.client.get<SubscriptionWithPayments>(this.path(subscriptionId))
  }

  /**
   * List subscriptions with filters
   */
  async list(filters?: SubscriptionListFilters): Promise<PaginatedResponse<RecurringSubscription>> {
    return this.client.get<PaginatedResponse<RecurringSubscription>>(this.path(''), {
      params: filters as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Update a subscription
   */
  async update(
    subscriptionId: string,
    data: UpdateSubscriptionRequest
  ): Promise<RecurringSubscription> {
    return this.put<RecurringSubscription>(subscriptionId, data)
  }

  /**
   * Sync subscription from Mangopay
   */
  async sync(subscriptionId: string): Promise<SyncSubscriptionResponse> {
    return this.post<SyncSubscriptionResponse>(`${subscriptionId}/sync`)
  }

  /**
   * Cancel a subscription (disable processing only)
   * This keeps the MangoPay registration active but disables local processing.
   * Use this when modifying a bundle (e.g., removing one product but keeping others).
   */
  async cancel(subscriptionId: string): Promise<RecurringSubscription> {
    return this.post<RecurringSubscription>(`${subscriptionId}/cancel`)
  }

  /**
   * End a subscription completely in MangoPay
   * This terminates the RecurringPayinRegistration in MangoPay (Status = ENDED)
   * and disables local processing. Use this when cancelling the entire bundle
   * (no remaining products).
   */
  async end(subscriptionId: string): Promise<RecurringSubscription> {
    return this.post<RecurringSubscription>(`${subscriptionId}/end`)
  }

  /**
   * Enable subscription processing
   */
  async enable(subscriptionId: string): Promise<RecurringSubscription> {
    return this.update(subscriptionId, { processingEnabled: true })
  }

  /**
   * Disable subscription processing
   */
  async disable(subscriptionId: string): Promise<RecurringSubscription> {
    return this.update(subscriptionId, { processingEnabled: false })
  }

  /**
   * Enable webhook notifications
   */
  async enableWebhooks(subscriptionId: string): Promise<RecurringSubscription> {
    return this.update(subscriptionId, { webhookNotificationEnabled: true })
  }

  /**
   * Disable webhook notifications
   */
  async disableWebhooks(subscriptionId: string): Promise<RecurringSubscription> {
    return this.update(subscriptionId, { webhookNotificationEnabled: false })
  }

  /**
   * List subscriptions for a MangoPay user
   * Useful for retrieving all subscriptions associated with a specific MangoPay user ID
   *
   * @param mangopayUserId - The MangoPay user ID
   * @param filters - Optional filters (subscriptionType, activeOnly)
   */
  async listByMangopayUser(
    mangopayUserId: string,
    filters?: MangopayUserSubscriptionFilters
  ): Promise<{ success: boolean; subscriptions: MangopayUserSubscription[] }> {
    const params: Record<string, string | boolean | undefined> = {}
    if (filters?.subscriptionType !== undefined && filters.subscriptionType !== '') {
      params['subscriptionType'] = filters.subscriptionType
    }
    if (filters?.activeOnly !== undefined) {
      params['activeOnly'] = String(filters.activeOnly)
    }

    return this.client.get<{ success: boolean; subscriptions: MangopayUserSubscription[] }>(
      this.path(`user/${mangopayUserId}`),
      { params }
    )
  }

  /**
   * Update a subscription by MangoPay registration ID
   * Useful when you only have the registration ID (not the internal subscription ID)
   * This is typically used after bundle splits to update the subscription name.
   *
   * @param registrationId - The MangoPay RecurringPayinRegistration ID
   * @param data - The update data (subscriptionName, metadata, bundleId, etc.)
   */
  async updateByRegistrationId(
    registrationId: string,
    data: UpdateSubscriptionRequest
  ): Promise<RecurringSubscription> {
    return this.put<RecurringSubscription>(`by-registration/${registrationId}`, data)
  }

  /**
   * Link products to a subscription
   * Creates subscription_products entries linking the subscription to products.
   * Supports direct product IDs (preferred) or lookup by type.
   *
   * @param subscriptionId - The FAM subscription ID
   * @param options - Link options (productIds preferred, or productTypes for lookup)
   *
   * @example
   * // Preferred: Use direct FAM product IDs
   * await fam.subscriptions.linkProducts('sub-123', {
   *   productIds: ['prod-abc', 'prod-def']
   * })
   *
   * @example
   * // Fallback: Lookup by product type
   * await fam.subscriptions.linkProducts('sub-123', {
   *   productTypes: ['mbc', 'ibo', 'global']
   * })
   */
  async linkProducts(
    subscriptionId: string,
    options: LinkProductsRequest
  ): Promise<LinkProductsResponse> {
    return this.post<LinkProductsResponse>(`${subscriptionId}/link-products`, options)
  }
}
