/**
 * Bundles module (FAM custom implementation)
 * Handles grouping multiple subscriptions into a single payment
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type {
  Bundle,
  BundleListFilters,
  BundlePriceInfo,
  BundleValidationResult,
  BundleWithSubscriptions,
  CreateBundleFromSubscriptionsRequest,
  CreateBundleResponse,
  CreateBundleWithNewSubscriptionsRequest,
  DissolveBundleResponse,
  UpdateBundleRequest,
} from '../types/bundles.js'
import type { PaginatedResponse } from '../types/common.js'

/**
 * Bundles API module
 * Groups multiple RecurringSubscriptions into a single payment
 */
export class BundlesModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/bundles')
  }

  /**
   * List bundles with optional filters
   *
   * @param filters - Optional filters (mangopayUserId, isActive, code)
   */
  async list(filters?: BundleListFilters): Promise<PaginatedResponse<Bundle>> {
    return this.client.get<PaginatedResponse<Bundle>>(this.path(''), {
      params: filters as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Get a bundle by ID (includes subscriptions)
   *
   * @param bundleId - The bundle ID
   */
  async getBundle(bundleId: string): Promise<BundleWithSubscriptions> {
    return this.client.get<BundleWithSubscriptions>(this.path(bundleId))
  }

  /**
   * Get a bundle by code
   *
   * @param code - The bundle code (e.g., 'mbc_ibo_global')
   */
  async getByCode(code: string): Promise<BundleWithSubscriptions> {
    return this.client.get<BundleWithSubscriptions>(this.path(`code/${code}`))
  }

  /**
   * Validate if a bundle can be created for a user
   * Checks dependency rules and returns subscriptions that need to be disabled
   *
   * @param subscriptionIds - IDs of subscriptions to bundle together
   * @param mangopayUserId - MangoPay user ID
   */
  async validate(
    subscriptionIds: string[],
    mangopayUserId: string
  ): Promise<BundleValidationResult> {
    return this.post<BundleValidationResult>('validate', {
      subscriptionIds,
      mangopayUserId,
    })
  }

  /**
   * Get bundle price information with proration calculation
   *
   * @param subscriptionIds - IDs of subscriptions to bundle
   * @param options - Price calculation options
   */
  async getPrice(
    subscriptionIds: string[],
    options?: {
      mangopayUserId?: string
      billingPeriod?: 'monthly' | 'yearly'
    }
  ): Promise<BundlePriceInfo> {
    return this.post<BundlePriceInfo>('price', {
      subscriptionIds,
      ...options,
    })
  }

  /**
   * Create a bundle from existing subscriptions
   * Groups existing subscriptions into a single payment
   *
   * @param data - Bundle creation data
   */
  async createFromSubscriptions(
    data: CreateBundleFromSubscriptionsRequest
  ): Promise<CreateBundleResponse> {
    return this.post<CreateBundleResponse>('', data)
  }

  /**
   * Create a bundle with new subscriptions (for new users)
   * Creates new subscriptions and groups them into a bundle
   *
   * @param data - Bundle subscription data
   */
  async subscribe(data: CreateBundleWithNewSubscriptionsRequest): Promise<CreateBundleResponse> {
    return this.post<CreateBundleResponse>('subscribe', data)
  }

  /**
   * Update a bundle
   * Can add/remove subscriptions and update metadata
   *
   * @param bundleId - The bundle ID
   * @param data - Update data
   */
  async update(bundleId: string, data: UpdateBundleRequest): Promise<BundleWithSubscriptions> {
    return this.put<BundleWithSubscriptions>(bundleId, data)
  }

  /**
   * Add subscriptions to an existing bundle
   *
   * @param bundleId - The bundle ID
   * @param subscriptionIds - IDs of subscriptions to add
   * @param newAmount - Optional new bundle amount
   */
  async addSubscriptions(
    bundleId: string,
    subscriptionIds: string[],
    newAmount?: number
  ): Promise<BundleWithSubscriptions> {
    const updateData: UpdateBundleRequest = {
      addSubscriptionIds: subscriptionIds,
    }
    if (newAmount !== undefined) {
      updateData.amount = newAmount
    }
    return this.update(bundleId, updateData)
  }

  /**
   * Remove subscriptions from a bundle
   *
   * @param bundleId - The bundle ID
   * @param subscriptionIds - IDs of subscriptions to remove
   * @param newAmount - Optional new bundle amount
   */
  async removeSubscriptions(
    bundleId: string,
    subscriptionIds: string[],
    newAmount?: number
  ): Promise<BundleWithSubscriptions> {
    const updateData: UpdateBundleRequest = {
      removeSubscriptionIds: subscriptionIds,
    }
    if (newAmount !== undefined) {
      updateData.amount = newAmount
    }
    return this.update(bundleId, updateData)
  }

  /**
   * Dissolve a bundle
   * Re-enables individual subscriptions and removes the bundle
   *
   * @param bundleId - The bundle ID
   */
  async dissolve(bundleId: string): Promise<DissolveBundleResponse> {
    return this.delete<DissolveBundleResponse>(bundleId)
  }

  /**
   * List bundles for a specific MangoPay user
   *
   * @param mangopayUserId - The MangoPay user ID
   * @param filters - Optional additional filters
   */
  async listByMangopayUser(
    mangopayUserId: string,
    filters?: Omit<BundleListFilters, 'mangopayUserId'>
  ): Promise<PaginatedResponse<Bundle>> {
    return this.list({ ...filters, mangopayUserId })
  }

  /**
   * Activate a bundle
   *
   * @param bundleId - The bundle ID
   */
  async activate(bundleId: string): Promise<BundleWithSubscriptions> {
    return this.update(bundleId, { isActive: true })
  }

  /**
   * Deactivate a bundle
   *
   * @param bundleId - The bundle ID
   */
  async deactivate(bundleId: string): Promise<BundleWithSubscriptions> {
    return this.update(bundleId, { isActive: false })
  }
}
