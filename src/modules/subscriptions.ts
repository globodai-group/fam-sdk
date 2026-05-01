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
  SubscriptionPayment,
  SubscriptionPaymentFilters,
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
   * List payments for a subscription (paginated, max 50 per page)
   */
  async listPayments(
    subscriptionId: string,
    filters?: SubscriptionPaymentFilters
  ): Promise<PaginatedResponse<SubscriptionPayment>> {
    return this.client.get<PaginatedResponse<SubscriptionPayment>>(
      this.path(`${subscriptionId}/payments`),
      { params: filters as Record<string, string | number | boolean | undefined | null> }
    )
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
   * **Pause** local processing of a subscription **without** terminating the
   * underlying Mangopay registration. The next scheduled charge will not
   * be processed by FAM, but the Mangopay `RecurringPayinRegistration`
   * stays in its current status — you can re-enable processing later via
   * {@link SubscriptionsModule.enable}.
   *
   * **Use this when**: a single product is being removed from a multi-product
   * bundle and the rest of the bundle should keep billing.
   *
   * **Do NOT use this** to terminate a subscription for good — the Mangopay
   * registration will remain in `Created` / `InProgress` and continue to
   * count against the user's active recurring registrations limit.
   * For a permanent termination, use {@link SubscriptionsModule.end}.
   *
   * @see SubscriptionsModule.end For permanent termination on the Mangopay side.
   */
  async cancel(subscriptionId: string): Promise<RecurringSubscription> {
    return this.post<RecurringSubscription>(`${subscriptionId}/cancel`)
  }

  /**
   * **Permanently terminate** a subscription on the Mangopay side. The
   * Mangopay `RecurringPayinRegistration` is moved to `Status = ENDED`
   * (irreversible) and local processing is disabled.
   *
   * **Use this when**: the entire bundle is cancelled and no remaining
   * product justifies keeping the recurring registration alive (e.g. user
   * full unsubscribe, account closure).
   *
   * **Do NOT use this** if you only want to pause billing temporarily or to
   * transition between bundles — once `ENDED`, a new
   * `RecurringPayinRegistration` must be created from scratch. For that,
   * use {@link SubscriptionsModule.cancel} instead.
   *
   * @see SubscriptionsModule.cancel For a pausable, non-destructive disable.
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
