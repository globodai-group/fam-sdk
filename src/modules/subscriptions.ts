/**
 * Subscriptions module (FAM custom implementation)
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { PaginatedResponse } from '../types/common.js'
import type {
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
   * Cancel a subscription
   */
  async cancel(subscriptionId: string): Promise<RecurringSubscription> {
    return this.post<RecurringSubscription>(`${subscriptionId}/cancel`)
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
}
